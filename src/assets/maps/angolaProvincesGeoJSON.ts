// Real Geographic GeoJSON Dataset for Angola's 21 Provinces (Divisão Político-Administrativa 2024)
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
          [12.02, -5.02], [12.20, -4.65], [12.45, -4.40], [12.75, -4.60], [12.85, -4.95],
          [12.90, -5.35], [12.65, -5.70], [12.25, -5.80], [12.10, -5.50], [12.02, -5.02]
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
          [12.18, -5.85], [12.82, -5.85], [13.40, -5.82], [14.05, -5.80], [14.40, -5.92],
          [14.85, -6.08], [14.92, -6.50], [14.90, -6.95], [14.45, -7.18], [13.75, -7.42],
          [13.15, -7.28], [12.72, -7.05], [12.45, -6.55], [12.18, -5.85]
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
          [14.85, -6.08], [15.60, -5.95], [16.50, -5.88], [17.20, -6.20], [17.78, -6.85],
          [17.82, -7.25], [17.10, -7.65], [16.45, -8.08], [15.82, -8.22], [15.22, -8.25],
          [14.55, -7.85], [14.45, -7.18], [14.90, -6.95], [14.92, -6.50], [14.85, -6.08]
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
          [12.72, -7.05], [13.15, -7.28], [13.75, -7.42], [14.45, -7.18], [14.55, -7.85],
          [14.32, -8.32], [14.18, -8.78], [13.88, -8.62], [13.52, -8.55], [13.25, -8.02],
          [12.92, -7.55], [12.72, -7.05]
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
          [13.38, -8.72], [13.88, -8.62], [14.12, -8.95], [14.18, -9.32], [13.85, -9.48],
          [13.52, -9.32], [13.32, -9.05], [13.38, -8.72]
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
          [13.12, -8.72], [13.38, -8.72], [13.32, -9.05], [13.10, -9.08], [12.98, -8.88], [13.12, -8.72]
        ]]
      }
    },
    {
      type: "Feature",
      id: "CNO",
      properties: { provinceCode: "Cuanza-Norte", name: "Cuanza-Norte", capital: "N'dalatando", region: "Norte", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [14.32, -8.32], [15.22, -8.25], [15.68, -8.82], [15.72, -9.42], [15.15, -9.68],
          [14.55, -9.75], [14.12, -8.95], [14.32, -8.32]
        ]]
      }
    },
    {
      type: "Feature",
      id: "CSU",
      properties: { provinceCode: "Cuanza-Sul", name: "Cuanza-Sul", capital: "Sumbe", region: "Centro", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [13.52, -9.32], [13.85, -9.48], [14.55, -9.75], [15.15, -9.68], [16.02, -9.85],
          [16.12, -10.55], [15.82, -11.42], [15.25, -11.95], [14.38, -12.08], [13.72, -11.45],
          [13.58, -10.65], [13.52, -9.32]
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
          [15.22, -8.25], [15.82, -8.22], [16.45, -8.08], [17.10, -7.65], [17.82, -7.25],
          [18.15, -7.88], [18.25, -8.72], [18.42, -9.85], [18.10, -10.82], [17.25, -11.25],
          [16.45, -11.42], [16.02, -9.85], [15.72, -9.42], [15.68, -8.82], [15.22, -8.25]
        ]]
      }
    },
    {
      type: "Feature",
      id: "LNO",
      properties: { provinceCode: "Lunda-Norte", name: "Lunda-Norte", capital: "Dundo", region: "Leste", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [17.82, -7.25], [18.75, -6.95], [19.82, -6.82], [20.85, -7.12], [21.85, -7.55],
          [22.12, -8.25], [21.88, -9.18], [21.05, -9.32], [19.82, -9.12], [18.25, -8.72],
          [18.15, -7.88], [17.82, -7.25]
        ]]
      }
    },
    {
      type: "Feature",
      id: "LSU",
      properties: { provinceCode: "Lunda-Sul", name: "Lunda-Sul", capital: "Saurimo", region: "Leste", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [18.25, -8.72], [19.82, -9.12], [21.05, -9.32], [21.88, -9.18], [22.25, -10.05],
          [22.35, -10.75], [21.15, -11.12], [19.85, -11.05], [18.42, -9.85], [18.25, -8.72]
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
          [18.42, -9.85], [19.85, -11.05], [21.15, -11.12], [21.65, -11.22], [21.85, -12.42],
          [21.75, -13.78], [20.85, -13.92], [19.25, -13.88], [18.65, -13.25], [18.10, -10.82],
          [18.42, -9.85]
        ]]
      }
    },
    {
      type: "Feature",
      id: "MXL",
      properties: { provinceCode: "Moxico Leste", name: "Moxico Leste", capital: "Cazombo", region: "Leste Fronteira", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [21.65, -11.22], [22.85, -10.95], [24.05, -10.82], [24.15, -12.15], [24.12, -13.45],
          [22.85, -13.68], [21.75, -13.78], [21.85, -12.42], [21.65, -11.22]
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
          [16.02, -9.85], [16.45, -11.42], [17.25, -11.25], [18.10, -10.82], [18.65, -13.25],
          [18.22, -14.12], [17.25, -14.28], [16.65, -13.85], [16.25, -12.82], [16.12, -11.45],
          [16.02, -9.85]
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
          [15.25, -11.95], [15.82, -11.42], [16.12, -11.45], [16.25, -12.82], [16.05, -13.72],
          [15.12, -13.58], [14.82, -12.82], [15.25, -11.95]
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
          [13.72, -11.45], [14.38, -12.08], [14.82, -12.82], [15.12, -13.58], [14.45, -13.82],
          [13.82, -13.88], [13.25, -13.78], [13.12, -12.82], [13.58, -11.88], [13.72, -11.45]
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
          [13.25, -13.78], [13.82, -13.88], [14.45, -13.82], [15.12, -13.58], [16.05, -13.72],
          [16.65, -13.85], [16.15, -14.65], [15.82, -15.85], [14.82, -15.82], [13.85, -15.75],
          [13.12, -14.85], [13.25, -13.78]
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
          [11.75, -13.72], [13.12, -12.82], [13.25, -13.78], [13.12, -14.85], [13.85, -15.75],
          [13.22, -17.18], [11.68, -17.15], [11.75, -13.72]
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
          [13.85, -15.75], [14.82, -15.82], [15.82, -15.85], [16.15, -14.65], [17.22, -15.42],
          [17.48, -17.38], [15.82, -17.35], [13.22, -17.18], [13.85, -15.75]
        ]]
      }
    },
    {
      type: "Feature",
      id: "CCU",
      properties: { provinceCode: "Cubango", name: "Cubango", capital: "Menongue", region: "Sudeste", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [16.65, -13.85], [17.25, -14.28], [18.22, -14.12], [19.25, -13.88], [19.38, -15.22],
          [19.42, -16.48], [17.48, -17.38], [17.22, -15.42], [16.65, -13.85]
        ]]
      }
    },
    {
      type: "Feature",
      id: "CND",
      properties: { provinceCode: "Quando", name: "Quando", capital: "Mavinga", region: "Sudeste Fronteira", isCapital: false },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [19.25, -13.88], [20.85, -13.92], [21.75, -13.78], [22.85, -13.68], [24.12, -13.45],
          [24.08, -18.02], [20.95, -18.00], [19.42, -16.48], [19.38, -15.22], [19.25, -13.88]
        ]]
      }
    }
  ]
};
