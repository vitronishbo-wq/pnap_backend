export interface AngolaProvinceData {
  provinceCode: string;
  geometryId: string;
  name: string;
  altName?: string;
  capital: string;
  region: "Norte" | "Norte Enclave" | "Litoral Norte" | "Litoral Centro" | "Litoral Sul" | "Planalto Central" | "Centro" | "Norte Interior" | "Leste" | "Leste Fronteira" | "Sul" | "Sul Fronteira" | "Sudeste" | "Sudeste Fronteira";
  isCapital: boolean;
  centerLng: number;
  centerLat: number;
}

export const ANGOLA_PROVINCES_21: AngolaProvinceData[] = [
  { provinceCode: "CAB", geometryId: "CAB", name: "Cabinda", capital: "Cabinda", region: "Norte Enclave", isCapital: false, centerLng: 12.35, centerLat: -5.15 },
  { provinceCode: "ZAI", geometryId: "ZAI", name: "Zaire", capital: "Mbanza Kongo", region: "Norte", isCapital: false, centerLng: 13.90, centerLat: -6.27 },
  { provinceCode: "UIG", geometryId: "UIG", name: "Uíge", capital: "Uíge", region: "Norte", isCapital: false, centerLng: 15.06, centerLat: -7.61 },
  { provinceCode: "BGO", geometryId: "BGO", name: "Bengo", capital: "Caxito", region: "Norte", isCapital: false, centerLng: 13.66, centerLat: -8.58 },
  { provinceCode: "ICB", geometryId: "ICB", name: "Icolo e Bengo", capital: "Catete", region: "Litoral Norte", isCapital: false, centerLng: 13.70, centerLat: -9.05 },
  { provinceCode: "LUA", geometryId: "LUA", name: "Luanda", capital: "Luanda", region: "Litoral Norte", isCapital: true, centerLng: 13.23, centerLat: -8.83 },
  { provinceCode: "CNO", geometryId: "CNO", name: "Cuanza Norte", altName: "Cuanza-Norte", capital: "N'dalatando", region: "Norte", isCapital: false, centerLng: 14.91, centerLat: -9.30 },
  { provinceCode: "CSU", geometryId: "CSU", name: "Cuanza Sul", altName: "Cuanza-Sul", capital: "Sumbe", region: "Centro", isCapital: false, centerLng: 14.35, centerLat: -11.20 },
  { provinceCode: "MAL", geometryId: "MAL", name: "Malanje", capital: "Malanje", region: "Norte Interior", isCapital: false, centerLng: 16.34, centerLat: -9.54 },
  { provinceCode: "LNO", geometryId: "LNO", name: "Lunda Norte", altName: "Lunda-Norte", capital: "Dundo", region: "Leste", isCapital: false, centerLng: 18.57, centerLat: -8.11 },
  { provinceCode: "LSU", geometryId: "LSU", name: "Lunda Sul", altName: "Lunda-Sul", capital: "Saurimo", region: "Leste", isCapital: false, centerLng: 20.39, centerLat: -9.66 },
  { provinceCode: "MOX", geometryId: "MOX", name: "Moxico", capital: "Luena", region: "Leste", isCapital: false, centerLng: 19.91, centerLat: -11.78 },
  { provinceCode: "MXL", geometryId: "MXL", name: "Moxico Leste", capital: "Cazombo", region: "Leste Fronteira", isCapital: false, centerLng: 22.90, centerLat: -11.90 },
  { provinceCode: "BIE", geometryId: "BIE", name: "Bié", capital: "Cuito", region: "Planalto Central", isCapital: false, centerLng: 16.94, centerLat: -12.38 },
  { provinceCode: "HUA", geometryId: "HUA", name: "Huambo", capital: "Huambo", region: "Planalto Central", isCapital: false, centerLng: 15.73, centerLat: -12.77 },
  { provinceCode: "BEN", geometryId: "BEN", name: "Benguela", capital: "Benguela", region: "Litoral Centro", isCapital: false, centerLng: 13.40, centerLat: -12.58 },
  { provinceCode: "HUI", geometryId: "HUI", name: "Huíla", capital: "Lubango", region: "Sul", isCapital: false, centerLng: 13.50, centerLat: -14.92 },
  { provinceCode: "NAM", geometryId: "NAM", name: "Namibe", capital: "Moçâmedes", region: "Litoral Sul", isCapital: false, centerLng: 12.15, centerLat: -15.19 },
  { provinceCode: "CUN", geometryId: "CUN", name: "Cunene", capital: "Ondjiva", region: "Sul Fronteira", isCapital: false, centerLng: 15.73, centerLat: -17.06 },
  { provinceCode: "CCU", geometryId: "CCU", name: "Cubango", altName: "Cuando Cubango", capital: "Menongue", region: "Sudeste", isCapital: false, centerLng: 17.79, centerLat: -14.66 },
  { provinceCode: "CND", geometryId: "CND", name: "Quando", capital: "Mavinga", region: "Sudeste Fronteira", isCapital: false, centerLng: 20.35, centerLat: -15.80 }
];
