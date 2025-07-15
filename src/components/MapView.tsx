import React, { useCallback, useEffect, useRef, useState } from 'react';
import Map, {
  Source,
  Layer,
  NavigationControl,
  Popup
} from 'react-map-gl';
import type { MapRef, ViewStateChangeEvent } from 'react-map-gl';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN!;

type SelectedFeature = {
  coordinates: [number, number];
  name: string;
};

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
  const [popupInfo, setPopupInfo] = useState<any | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -97.5,
    latitude: 30.3,
    zoom: 5,
  });

  const mapRef = useRef<any>(null);


  useEffect(() => {
    const loadGeoJSON = async () => {
      const [power, oil, subs] = await Promise.all([
        fetch('/data/powerPlants.geojson').then(res => res.json()),
        fetch('/data/oilGasFields.geojson').then(res => res.json()),
        fetch('/data/substations.geojson').then(res => res.json()),
      ]);

      setLayerData({
        powerPlants: power,
        oilGasFields: oil,
        substations: subs,
      });
    };

    loadGeoJSON();
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
        props: { name: selectedFeature.name },
      });
    }
  }, [selectedFeature]);

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

 const handleMove = (evt: { viewState: typeof viewState }) => {
  setViewState(evt.viewState);
};


  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={handleMove}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/outdoors-v12"
      style={{ height: '500px', borderRadius: 12 }}
      projection={{ name: 'globe' }}
      interactiveLayerIds={Object.keys(visibleLayers)
        .filter(k => visibleLayers[k as keyof typeof visibleLayers])
        .map(k => `${k}-layer`)}
      onClick={handleClick}
    >
      <NavigationControl position="top-right" />

      {Object.entries(visibleLayers).map(([key, isVisible]) =>
        isVisible && layerData[key] ? (
          <Source key={key} id={`${key}-source`} type="geojson" data={layerData[key]}>
            <Layer {...layerStyle} id={`${key}-layer`} />
          </Source>
        ) : null
      )}

      {popupInfo && (
        <Popup
          longitude={popupInfo.coordinates[0]}
          latitude={popupInfo.coordinates[1]}
          closeOnClick={false}
          onClose={() => setPopupInfo(null)}
        >
          <div style={{ fontFamily: 'Roboto, sans-serif' }}>
            <strong>{popupInfo.props.name || 'Unknown'}</strong>
          </div>
        </Popup>
      )}
    </Map>
  );
};

export default MapView;
