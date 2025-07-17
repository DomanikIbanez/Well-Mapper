import React, { useCallback, useEffect, useRef, useState } from 'react';
import Map, { Source, Layer, NavigationControl, Popup, MapRef, Marker } from 'react-map-gl';
import type { Feature, Point, Polygon } from 'geojson';
import { Box, IconButton, Tooltip } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import ReplayIcon from '@mui/icons-material/Replay';
import ExploreIcon from '@mui/icons-material/Explore';
import Draw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import type { FeatureRow as SelectedFeature } from './FeatureTable';


const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN!;

interface MapViewProps {
  selectedFeature: SelectedFeature | null;
}

const layerStyle = {
  type: 'circle',
  paint: {
    'circle-radius': 6,
    'circle-color': '#1976d2',
    'circle-stroke-width': 1,
    'circle-stroke-color': '#fff',
  },
};

const MapView: React.FC<MapViewProps> = ({ selectedFeature }) => {
  const visibleLayers = useSelector((state: RootState) => state.layers.visibleLayers);
  const [layerData, setLayerData] = useState<Record<string, GeoJSON.FeatureCollection>>({});
  const [filteredData, setFilteredData] = useState<Record<string, GeoJSON.FeatureCollection>>({});
  const [popupInfo, setPopupInfo] = useState<any | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -97.5,
    latitude: 30.3,
    zoom: 5,
  });

  const mapRef = useRef<any | null>(null);
  const drawRef = useRef<Draw | null>(null);

  useEffect(() => {
    const loadGeoJSON = async () => {
      const [power, oil, subs] = await Promise.all([
        fetch('/data/powerPlants.geojson').then(res => res.json()),
        fetch('/data/oilGasFields.geojson').then(res => res.json()),
        fetch('/data/substations.geojson').then(res => res.json()),
      ]);

      const all = {
        powerPlants: power,
        oilGasFields: oil,
        substations: subs,
      };

      setLayerData(all);
      setFilteredData(all);
    };

    loadGeoJSON();
  }, []);

  const updateFilters = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || !drawRef.current) return;

    const polygons = drawRef.current.getAll();
    if (!polygons.features.length) {
      setFilteredData(layerData);
      return;
    }

    const polygon = polygons.features[0];

    const newFiltered: Record<string, GeoJSON.FeatureCollection> = {};

    Object.entries(layerData).forEach(([key, data]) => {
      const filtered = {
        ...data,
        features: data.features.filter(
          (feature): feature is Feature<Point> =>
            feature.geometry.type === 'Point' &&
            turf.booleanPointInPolygon(feature as Feature<Point>, polygon as Feature<Polygon>)
        ),
      };
      newFiltered[key] = filtered;
    });

    setFilteredData(newFiltered);
  }, [layerData]);

  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || drawRef.current) return;

    drawRef.current = new Draw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
    });

    map.addControl(drawRef.current, 'top-left');

    map.on('draw.create', updateFilters);
    map.on('draw.update', updateFilters);
    map.on('draw.delete', () => {
      setFilteredData(layerData);
    });
  }, [updateFilters, layerData]);

  const handleClick = useCallback((event: any) => {
    const feature = event.features?.[0];
    if (!feature) return;

    const coords = feature.geometry.coordinates;
    const props = feature.properties;

    setPopupInfo({
      coordinates: coords,
      props,
    });
  }, []);

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
      interactiveLayerIds={Object.keys(visibleLayers)
        .filter(k => visibleLayers[k as keyof typeof visibleLayers])
        .map(k => `${k}-layer`)}
      onClick={handleClick}
    >
      <NavigationControl 
        position="top-right" 
        showCompass={true}
        visualizePitch={true}
      />

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
            onClick={() =>
              mapRef.current?.getMap().rotateTo(mapRef.current.getMap().getBearing() - 15)
            }
            sx={{
              backgroundColor: '#fff',
              borderRadius: 2,
              boxShadow: 1,
              '&:hover': { backgroundColor: '#f0f0f0' },
            }}
          >
            <RotateLeftIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Rotate Right" placement="left">
          <IconButton
            size="small"
            onClick={() =>
              mapRef.current?.getMap().rotateTo(mapRef.current.getMap().getBearing() + 15)
            }
            sx={{
              backgroundColor: '#fff',
              borderRadius: 2,
              boxShadow: 1,
              '&:hover': { backgroundColor: '#f0f0f0' },
            }}
          >
            <RotateRightIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Reset Pitch" placement="left">
          <IconButton
            size="small"
            onClick={() =>
              mapRef.current?.getMap().easeTo({ pitch: 0, duration: 500 })
            }
            sx={{
              backgroundColor: '#fff',
              borderRadius: 2,
              boxShadow: 1,
              '&:hover': { backgroundColor: '#f0f0f0' },
            }}
          >
            <ReplayIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Tilt to Ground View" placement="left">
          <IconButton
            size="small"
            onClick={() =>
              mapRef.current?.getMap().easeTo({
                pitch: 75,
                bearing: 20,
                zoom: 6,
                duration: 800,
              })
            }
            sx={{
              backgroundColor: '#fff',
              borderRadius: 2,
              boxShadow: 1,
              '&:hover': { backgroundColor: '#f0f0f0' },
            }}
          >
            <ExploreIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {Object.entries(visibleLayers).map(([key, isVisible]) =>
  isVisible && filteredData[key]
    ? filteredData[key].features.map((feature, i) => {
        if (feature.geometry.type !== 'Point') return null;
        const [lng, lat] = feature.geometry.coordinates;
        return (
          <Marker
            key={`${key}-${i}`}
            longitude={lng}
            latitude={lat}
            anchor="bottom"
            onClick={(e: React.MouseEvent) => {
              setPopupInfo({ coordinates: [lng, lat], props: feature.properties });
            }}
          >
            <img
              src="/icons/marker-icon-blue.png"
              alt="marker"
              style={{ height: 30 }}
            />
          </Marker>
        );
      })
    : null
)}

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
            <strong style={{ fontSize: '1rem' }}>
                {popupInfo.props.name || 'Unknown'}
            </strong>
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '8px 0' }} />
            <div><b>Type:</b> {popupInfo.props.type}</div>
            <div><b>City:</b> {popupInfo.props.city}</div>
            <div><b>Capacity:</b> {popupInfo.props.capacity_mw} MW</div>
            <div><b>Status:</b> {popupInfo.props.status}</div>
            <div><b>Operator:</b> {popupInfo.props.operator}</div>
            <div><b>Commissioned:</b> {popupInfo.props.commissioned}</div>
            </div>
        </Popup>
        )}

    </Map>
  );
};

export default MapView;
