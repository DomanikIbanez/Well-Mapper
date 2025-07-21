import React, { useCallback, useEffect, useRef, useState } from 'react';
import Map, { NavigationControl, Popup, Marker } from 'react-map-gl';
import Draw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import type { FeatureRow } from './FeatureTable';
import { Box, IconButton, Tooltip } from '@mui/material';
import type { Feature, Polygon } from 'geojson';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import ReplayIcon from '@mui/icons-material/Replay';
import ExploreIcon from '@mui/icons-material/Explore';
import type { LayerSettings } from '../App';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN!;

interface MapViewProps {
  selectedFeature: FeatureRow | null;
  featureData: FeatureRow[];
  layerSettings: Record<string, LayerSettings>;
}

const MapView: React.FC<MapViewProps> = ({ selectedFeature, featureData, layerSettings }) => {
  const visibleLayers = useSelector((state: RootState) => state.layers.visibleLayers);
  const [popupInfo, setPopupInfo] = useState<any | null>(null);
  const [filteredFeatures, setFilteredFeatures] = useState<FeatureRow[]>(featureData);

  const [viewState, setViewState] = useState({
    longitude: -97.5,
    latitude: 30.3,
    zoom: 5,
  });

  const mapRef = useRef<any | null>(null);
  const drawRef = useRef<Draw | null>(null);

  // Apply all filters: layer toggles, dropdown filters, polygon
  const applyAllFilters = useCallback(() => {
    const drawn = drawRef.current?.getAll();

    const filtered = featureData.filter((f) => {
      // Determine layer key based on type
      const layerKey =
        f.type?.toLowerCase().includes('plant') ? 'powerPlants' :
        f.type?.toLowerCase().includes('oil') ? 'oilGasFields' :
        'substations';

      if (!visibleLayers[layerKey]) return false;

      const settings = layerSettings[layerKey] || {};
      if (settings.city && settings.city !== 'All' && f.city !== settings.city) return false;
      if (settings.status && settings.status !== 'All' && f.status !== settings.status) return false;
      if (settings.operator && settings.operator !== 'All' && f.operator !== settings.operator) return false;

      // Polygon filter
      if (drawn && drawn.features.length > 0) {
        const point = turf.point(f.coordinates);
        const insideAny = drawn.features.some(
          (poly) =>
            poly.geometry.type === 'Polygon' &&
            turf.booleanPointInPolygon(point, poly as Feature<Polygon>)
        );
        if (!insideAny) return false;
      }

      return true;
    });

    setFilteredFeatures(filtered);
  }, [featureData, visibleLayers, layerSettings]);

  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || drawRef.current) return;

    drawRef.current = new Draw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
    });
    map.addControl(drawRef.current, 'top-left');

    map.on('draw.create', applyAllFilters);
    map.on('draw.update', applyAllFilters);
    map.on('draw.delete', () => setFilteredFeatures(featureData));
  }, [applyAllFilters, featureData]);

  useEffect(() => {
    applyAllFilters();
  }, [featureData, layerSettings, visibleLayers, applyAllFilters]);

  useEffect(() => {
    if (selectedFeature && mapRef.current) {
      mapRef.current.flyTo({
        center: selectedFeature.coordinates,
        zoom: 10,
        essential: true,
      });
      setPopupInfo({
        coordinates: selectedFeature.coordinates,
        props: selectedFeature,
      });
    }
  }, [selectedFeature]);

  const handleMove = (evt: { viewState: typeof viewState }) => {
    setViewState(evt.viewState);
  };

  return (
    <Map
      ref={mapRef}
      onLoad={handleMapLoad}
      {...viewState}
      onMove={handleMove}
      mapboxAccessToken={MAPBOX_TOKEN}
      style={{ height: '75vh', borderRadius: 12 }}
      mapStyle="mapbox://styles/mapbox/outdoors-v12"
      projection={{ name: 'globe' }}
    >
      {/* Zoom & Compass */}
      <NavigationControl position="top-right" showCompass={true} visualizePitch={true} showZoom={true} />

      {/* Rotation / Tilt Buttons */}
      <Box
        sx={{
          position: 'absolute',
          top: 120,
          right: 10,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Tooltip title="Rotate Left" placement="left">
          <IconButton
            size="small"
            onClick={() => mapRef.current?.getMap().rotateTo(mapRef.current.getMap().getBearing() - 15)}
            sx={{ backgroundColor: '#fff', borderRadius: 2, boxShadow: 1, '&:hover': { backgroundColor: '#f0f0f0' } }}
          >
            <RotateLeftIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Rotate Right" placement="left">
          <IconButton
            size="small"
            onClick={() => mapRef.current?.getMap().rotateTo(mapRef.current.getMap().getBearing() + 15)}
            sx={{ backgroundColor: '#fff', borderRadius: 2, boxShadow: 1, '&:hover': { backgroundColor: '#f0f0f0' } }}
          >
            <RotateRightIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Reset Pitch" placement="left">
          <IconButton
            size="small"
            onClick={() => mapRef.current?.getMap().easeTo({ pitch: 0, duration: 500 })}
            sx={{ backgroundColor: '#fff', borderRadius: 2, boxShadow: 1, '&:hover': { backgroundColor: '#f0f0f0' } }}
          >
            <ReplayIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Tilt to Ground View" placement="left">
          <IconButton
            size="small"
            onClick={() =>
              mapRef.current?.getMap().easeTo({ pitch: 75, bearing: 20, zoom: 6, duration: 800 })
            }
            sx={{ backgroundColor: '#fff', borderRadius: 2, boxShadow: 1, '&:hover': { backgroundColor: '#f0f0f0' } }}
          >
            <ExploreIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* PNG Markers */}
      {filteredFeatures.map((f) => {
        const [lng, lat] = f.coordinates;
        return (
          <Marker key={f.id} longitude={lng} latitude={lat} anchor="bottom">
            <img
              src="/icons/marker-icon-blue.png"
              alt="marker"
              style={{ height: 30, cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation?.();
                setPopupInfo({ coordinates: [lng, lat], props: f });
              }}
              onTouchStart={(e) => {
                e.stopPropagation?.();
                setPopupInfo({ coordinates: [lng, lat], props: f });
              }}
            />
          </Marker>
        );
      })}

      {/* Popup */}
      {popupInfo && (
        <Popup
          longitude={popupInfo.coordinates[0]}
          latitude={popupInfo.coordinates[1]}
          closeOnClick={false}
          onClose={() => setPopupInfo(null)}
        >
          <div
            style={{
              fontFamily: 'Roboto, sans-serif',
              backgroundColor: '#f4f6fc',
              color: '#0d47a1',
              padding: '10px',
              borderRadius: '8px',
              minWidth: '220px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            <strong style={{ fontSize: '1rem' }}>{popupInfo.props.name || 'Unknown'}</strong>
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '8px 0' }} />
            <div><b>Type:</b> {popupInfo.props.type}</div>
            <div><b>City:</b> {popupInfo.props.city}</div>
            <div><b>Status:</b> {popupInfo.props.status}</div>
            <div><b>Operator:</b> {popupInfo.props.operator}</div>
            <div><b>Capacity:</b> {popupInfo.props.capacity_mw} MW</div>
            <div><b>Commissioned:</b> {popupInfo.props.commissioned}</div>
          </div>
        </Popup>
      )}
    </Map>
  );
};

export default MapView;
