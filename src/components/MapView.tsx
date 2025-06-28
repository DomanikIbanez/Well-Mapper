import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN!;

const MapView: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null); 

  const selectedWell = useSelector((state: RootState) => state.well.selectedWell);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-95.3698, 29.7604],
      zoom: 5,
    });
    // new mapboxgl.Marker()
    //   .setLngLat([-95.3698, 29.7604])
    //   .setPopup(new mapboxgl.Popup().setText("Houston, TX"))
    //   .addTo(map.current);
  }, []);

   useEffect(() => {
    if (!map.current || !selectedWell) return;

    // Fly to new location
    map.current.flyTo({
      center: [selectedWell.lng, selectedWell.lat],
      zoom: 8,
      essential: true,
    });

    // Remove old marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Add new marker
    markerRef.current = new mapboxgl.Marker()
      .setLngLat([selectedWell.lng, selectedWell.lat])
      .setPopup(new mapboxgl.Popup().setText(selectedWell.name))
      .addTo(map.current);

  }, [selectedWell]);

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height: '500px', border: '1px solid lightgray' }}
    />
  );
};

export default MapView;
export {};
