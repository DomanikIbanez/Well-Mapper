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

  const [viewState, setViewState] = useState({ longitude: -97.5, latitude: 30.3, zoom: 5 });

  const mapRef = useRef<any | null>(null);
  const drawRef = useRef<Draw | null>(null);

  const applyPolygonFilter = useCallback(() => {
    const drawn = drawRef.current?.getAll();
    if (!drawn || drawn.features.length === 0) {
      setFilteredFeatures(featureData);
      return;
    }

    const polygons = drawn.features.filter((f) => f.geometry.type === 'Polygon');

    const filtered = featureData.filter((f) => {
      const point = turf.point(f.coordinates);
      return polygons.some((poly) =>
        turf.booleanPointInPolygon(point, poly as Feature<Polygon>)
      );
    });

    setFilteredFeatures(filtered);
  }, [featureData]);

  const applyLayerFilters = useCallback(() => {
    let filtered = featureData;

    filtered = filtered.filter((f) => {
      const layerKey =
        f.type?.toLowerCase().includes('plant') ? 'powerPlants' :
        f.type?.toLowerCase().includes('oil') ? 'oilGasFields' :
        'substations';

      if (!visibleLayers[layerKey]) return false;

      const settings = layerSettings[layerKey] || {};
      if (settings.city && f.city !== settings.city) return false;
      if (settings.status && f.status !== settings.status) return false;
      if (settings.operator && f.operator !== settings.operator) return false;

      return true;
    });

    setFilteredFeatures(filtered);
  }, [featureData, layerSettings, visibleLayers]);

  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || drawRef.current) return;

    drawRef.current = new Draw({ displayControlsDefault: false, controls: { polygon: true, trash: true } });
    map.addControl(drawRef.current, 'top-left');

    map.on('draw.create', applyPolygonFilter);
    map.on('draw.update', applyPolygonFilter);
    map.on('draw.delete', () => setFilteredFeatures(featureData));
  }, [applyPolygonFilter, featureData]);

  useEffect(() => {
    applyLayerFilters();
  }, [featureData, visibleLayers, layerSettings, applyLayerFilters]);

  useEffect(() => {
    if (selectedFeature && mapRef.current) {
      mapRef.current.flyTo({ center: selectedFeature.coordinates, zoom: 10, essential: true });
      setPopupInfo({ coordinates: selectedFeature.coordinates, props: selectedFeature });
    }
  }, [selectedFeature]);

  const handleMove = (evt: { viewState: typeof viewState }) => setViewState(evt.viewState);

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
      <NavigationControl position="top-right" showCompass={true} showZoom={true} visualizePitch={true} />

      {/* Rotation/Tilt Controls */}
      <Box sx={{ position: 'absolute', top: 120, right: 10, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {[{ icon: <RotateLeftIcon />, title: 'Rotate Left', action: () => mapRef.current?.getMap().rotateTo(mapRef.current.getMap().getBearing() - 15) },
          { icon: <RotateRightIcon />, title: 'Rotate Right', action: () => mapRef.current?.getMap().rotateTo(mapRef.current.getMap().getBearing() + 15) },
          { icon: <ReplayIcon />, title: 'Reset Pitch', action: () => mapRef.current?.getMap().easeTo({ pitch: 0, duration: 500 }) },
          { icon: <ExploreIcon />, title: 'Tilt to Ground View', action: () => mapRef.current?.getMap().easeTo({ pitch: 75, bearing: 20, zoom: 6, duration: 800 }) }]
          .map(({ icon, title, action }, i) => (
            <Tooltip title={title} key={i} placement="left">
              <IconButton size="small" onClick={action} sx={{ backgroundColor: '#fff', borderRadius: 2, boxShadow: 1, '&:hover': { backgroundColor: '#f0f0f0' } }}>
                {icon}
              </IconButton>
            </Tooltip>
          ))}
      </Box>

      {/* Render PNG markers */}
      {filteredFeatures.map((f) => {
        const [lng, lat] = f.coordinates;
        return (
          <Marker key={f.id} longitude={lng} latitude={lat} anchor="bottom">
            <img
              src="/icons/marker-icon-blue.png"
              alt="marker"
              style={{ height: 30, cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation?.(); setPopupInfo({ coordinates: [lng, lat], props: f }); }}
              onTouchStart={(e) => { e.stopPropagation?.(); setPopupInfo({ coordinates: [lng, lat], props: f }); }}
            />
          </Marker>
        );
      })}

      {/* Popup */}
      {popupInfo && (
        <Popup longitude={popupInfo.coordinates[0]} latitude={popupInfo.coordinates[1]} closeOnClick={false} onClose={() => setPopupInfo(null)}>
          <div style={{ fontFamily: 'Roboto, sans-serif', backgroundColor: '#f4f6fc', color: '#0d47a1', padding: '10px', borderRadius: '8px', minWidth: '220px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
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
