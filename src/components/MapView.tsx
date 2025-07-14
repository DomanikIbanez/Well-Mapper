import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN!;

type SelectedFeature = {
  coordinates: [number, number];
  name: string;
};

interface MapViewProps {
  selectedFeature: SelectedFeature | null;
}

const MapView: React.FC<MapViewProps> = ({ selectedFeature }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const visibleLayers = useSelector((state: RootState) => state.layers.visibleLayers);

  const [layerData, setLayerData] = useState<Record<string, GeoJSON.FeatureCollection>>({});

  useEffect(() => {
    const loadGeoJSON = async () => {
      const [power, oil, substations] = await Promise.all([
        fetch('/data/powerPlants.geojson').then(res => res.json()),
        fetch('/data/oilGasFields.geojson').then(res => res.json()),
        fetch('/data/substations.geojson').then(res => res.json()),
      ]);

      setLayerData({
        powerPlants: power,
        oilGasFields: oil,
        substations: substations,
      });
    };

    loadGeoJSON();
  }, []);

  useEffect(() => {
    if (!mapRef.current && mapContainer.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-97.5, 30.3],
        zoom: 5,
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || Object.keys(layerData).length === 0) return;

    const handleLoad = () => {
      Object.entries(visibleLayers).forEach(([key, isVisible]) => {
        const sourceId = `${key}-source`;
        const layerId = `${key}-layer`;

        if (isVisible) {
          if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
              type: 'geojson',
              data: layerData[key],
            });
          }

          if (!map.getLayer(layerId)) {
            map.addLayer({
              id: layerId,
              type: 'circle',
              source: sourceId,
              paint: {
                'circle-radius': 7,
                'circle-color': '#007cbf',
              },
            });

            map.on('click', layerId, (e: mapboxgl.MapMouseEvent) => {
              const feature = e.features?.[0];
              if (!feature) return;

              const coordinates = feature.geometry.type === 'Point'
                ? (feature.geometry.coordinates as [number, number])
                : [0, 0];

              const props = feature.properties || {};
              const content = `
                <div style="font-family: Roboto, sans-serif; padding: 8px; max-width: 240px;">
                  <div style="font-weight: bold; font-size: 16px; color: #1976d2;">
                    ${props.name || 'Unknown Site'}
                  </div>
                  <div style="margin-top: 4px; font-size: 14px;">
                    <strong>Type:</strong> ${props.type || 'N/A'}<br/>
                    <strong>City:</strong> ${props.city || 'N/A'}
                  </div>
                </div>`;

              new mapboxgl.Popup()
                .setLngLat(coordinates as [number, number])
                .setHTML(content)
                .addTo(map);
            });

            map.on('mouseenter', layerId, () => {
              map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', layerId, () => {
              map.getCanvas().style.cursor = '';
            });
          }
        } else {
          if (map.getLayer(layerId)) map.removeLayer(layerId);
          if (map.getSource(sourceId)) map.removeSource(sourceId);
        }
      });
    };

    if (map.isStyleLoaded()) {
      handleLoad();
    } else {
      map.once('load', handleLoad);
    }
  }, [visibleLayers, layerData]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedFeature) return;

    map.flyTo({
      center: selectedFeature.coordinates,
      zoom: 10,
      essential: true,
    });

    new mapboxgl.Popup()
      .setLngLat(selectedFeature.coordinates)
      .setHTML(`<strong>${selectedFeature.name}</strong>`)
      .addTo(map);
  }, [selectedFeature]);

  return <div ref={mapContainer} style={{ height: '500px' }} />;
};

export default MapView;
