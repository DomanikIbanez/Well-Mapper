declare module '*.geojson' {
  const value: {
    type: 'FeatureCollection';
    features: GeoJSON.Feature[];
  };
  export default value;
}
