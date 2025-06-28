import React, { useEffect, useRef } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

//pull token from .env
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapView: React.FC = () => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-95.3698, 29.7604],
            zoom: 5,
        });

        //add starter marker
        new mapboxgl.Marker()
        .setLngLat([-95.3698, 29.7604])
        .setPopup(new mapboxgl.Popup().setText("Houston, TX"))
        .addTo(map.current);
    }, []);

    return (
        <div
            ref={mapContainer}
            style={{ width: '100%', height: '500px', border: '1xp solid lightgray' }}
        />
    );
};

export default MapView;