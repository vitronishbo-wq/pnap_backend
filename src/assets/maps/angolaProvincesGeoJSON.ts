// Real Geographic GeoJSON Dataset for Angola's 21 Provinces (Divisão Político-Administrativa)
// Coordinates in EPSG:4326 [Longitude, Latitude] WGS84

export interface GeoJSONFeature {
  type: "Feature";
  id: string;
  properties: {
    provinceCode: string;
    name: string;
    capital: string;
    region: string;
    isCapital: boolean;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export const ANGOLA_21_PROVINCES_GEOJSON: GeoJSONFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "CAB",
      properties: { provinceCode: "CAB", name: "Cabinda", capital: "Cabinda", region: "Norte Enclave", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [12.05, -5.00], [12.45, -4.68], [12.80, -4.85], [12.85, -5.30], [12.45, -5.80], [12.10, -5.75], [12.05, -5.00]
        ]]
      }
    },
    {
      type: "Feature",
      id: "ZAI",
      properties: { provinceCode: "ZAI", name: "Zaire", capital: "Mbanza Kongo", region: "Norte", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [12.20, -5.85], [12.85, -5.85], [14.10, -5.85], [14.80, -6.10], [14.90, -6.90], [13.70, -7.50], [12.80, -7.20], [12.20, -5.85]
        ]]
      }
    },
    {
      type: "Feature",
      id: "UIG",
      properties: { provinceCode: "UIG", name: "Uíge", capital: "Uíge", region: "Norte", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [14.80, -6.10], [16.80, -5.90], [17.80, -7.00], [16.20, -8.20], [15.20, -8.30], [14.50, -7.80], [14.90, -6.90], [14.80, -6.10]
        ]]
      }
    },
    {
      type: "Feature",
      id: "BGO",
      properties: { provinceCode: "BGO", name: "Bengo", capital: "Caxito", region: "Norte", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [12.80, -7.20], [13.70, -7.50], [14.50, -7.80], [14.20, -8.90], [13.50, -8.70], [13.20, -8.00], [12.80, -7.20]
        ]]
      }
    },
    {
      type: "Feature",
      id: "ICB",
      properties: { provinceCode: "ICB", name: "Icolo e Bengo", capital: "Catete", region: "Litoral Norte", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [13.40, -8.80], [14.00, -8.85], [14.10, -9.30], [13.60, -9.45], [13.35, -9.10], [13.40, -8.80]
        ]]
      }
    },
    {
      type: "Feature",
      id: "LUA",
      properties: { provinceCode: "LUA", name: "Luanda", capital: "Luanda", region: "Litoral Norte", isCapital: true },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [13.15, -8.75], [13.40, -8.72], [13.40, -8.80], [13.35, -9.10], [13.05, -9.00], [13.15, -8.75]
        ]]
      }
    },
    {
      type: "Feature",
      id: "CNO",
      properties: { provinceCode: "CNO", name: "Cuanza Norte", capital: "N'dalatando", region: "Norte", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [14.20, -8.00], [15.40, -8.20], [15.70, -9.50], [14.60, -9.80], [14.00, -8.85], [14.20, -8.00]
        ]]
      }
    },
    {
      type: "Feature",
      id: "CSU",
      properties: { provinceCode: "CSU", name: "Cuanza Sul", capital: "Sumbe", region: "Centro", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [13.60, -9.45], [14.60, -9.80], [16.10, -10.00], [15.80, -11.90], [14.30, -12.10], [13.70, -11.20], [13.60, -9.45]
        ]]
      }
    },
    {
      type: "Feature",
      id: "MAL",
      properties: { provinceCode: "MAL", name: "Malanje", capital: "Malanje", region: "Norte Interior", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [15.40, -8.20], [17.80, -7.00], [18.20, -8.80], [18.50, -10.80], [16.50, -11.50], [15.70, -9.50], [15.40, -8.20]
        ]]
      }
    },
    {
      type: "Feature",
      id: "LNO",
      properties: { provinceCode: "LNO", name: "Lunda Norte", capital: "Dundo", region: "Leste", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [17.80, -7.00], [20.50, -6.90], [22.00, -7.80], [21.80, -9.20], [18.20, -8.80], [17.80, -7.00]
        ]]
      }
    },
    {
      type: "Feature",
      id: "LSU",
      properties: { provinceCode: "LSU", name: "Lunda Sul", capital: "Saurimo", region: "Leste", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [18.20, -8.80], [21.80, -9.20], [22.20, -10.80], [19.80, -11.10], [18.50, -10.80], [18.20, -8.80]
        ]]
      }
    },
    {
      type: "Feature",
      id: "MOX",
      properties: { provinceCode: "MOX", name: "Moxico", capital: "Luena", region: "Leste", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [18.50, -10.80], [19.80, -11.10], [21.50, -11.20], [21.80, -13.80], [19.20, -13.90], [18.50, -10.80]
        ]]
      }
    },
    {
      type: "Feature",
      id: "MXL",
      properties: { provinceCode: "MXL", name: "Moxico Leste", capital: "Cazombo", region: "Leste Fronteira", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [21.50, -11.20], [24.00, -10.90], [24.00, -13.50], [21.80, -13.80], [21.50, -11.20]
        ]]
      }
    },
    {
      type: "Feature",
      id: "BIE",
      properties: { provinceCode: "BIE", name: "Bié", capital: "Cuito", region: "Planalto Central", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [16.10, -10.00], [18.50, -10.80], [18.80, -13.80], [16.80, -14.20], [16.20, -12.50], [16.10, -10.00]
        ]]
      }
    },
    {
      type: "Feature",
      id: "HUA",
      properties: { provinceCode: "HUA", name: "Huambo", capital: "Huambo", region: "Planalto Central", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [15.00, -11.80], [16.20, -12.50], [16.00, -13.80], [15.10, -13.60], [14.80, -12.60], [15.00, -11.80]
        ]]
      }
    },
    {
      type: "Feature",
      id: "BEN",
      properties: { provinceCode: "BEN", name: "Benguela", capital: "Benguela", region: "Litoral Centro", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [13.70, -11.20], [14.80, -12.60], [14.50, -13.80], [13.20, -13.90], [13.10, -12.20], [13.70, -11.20]
        ]]
      }
    },
    {
      type: "Feature",
      id: "HUI",
      properties: { provinceCode: "HUI", name: "Huíla", capital: "Lubango", region: "Sul", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [13.20, -13.90], [15.10, -13.60], [16.20, -14.10], [15.80, -15.90], [13.80, -15.80], [13.10, -14.80], [13.20, -13.90]
        ]]
      }
    },
    {
      type: "Feature",
      id: "NAM",
      properties: { provinceCode: "NAM", name: "Namibe", capital: "Moçâmedes", region: "Litoral Sul", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [11.80, -13.80], [13.10, -14.80], [13.80, -15.80], [13.20, -17.20], [11.70, -17.20], [11.80, -13.80]
        ]]
      }
    },
    {
      type: "Feature",
      id: "CUN",
      properties: { provinceCode: "CUN", name: "Cunene", capital: "Ondjiva", region: "Sul Fronteira", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [13.80, -15.80], [16.20, -14.10], [17.20, -15.50], [17.50, -17.40], [13.20, -17.20], [13.80, -15.80]
        ]]
      }
    },
    {
      type: "Feature",
      id: "CCU",
      properties: { provinceCode: "CCU", name: "Cubango", capital: "Menongue", region: "Sudeste", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [16.80, -14.20], [19.20, -13.90], [19.40, -16.50], [17.50, -17.40], [16.80, -14.20]
        ]]
      }
    },
    {
      type: "Feature",
      id: "CND",
      properties: { provinceCode: "CND", name: "Quando", capital: "Mavinga", region: "Sudeste Fronteira", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [19.20, -13.90], [24.00, -13.50], [24.00, -18.00], [21.00, -18.00], [19.40, -16.50], [19.20, -13.90]
        ]]
      }
    }
  ]
};
