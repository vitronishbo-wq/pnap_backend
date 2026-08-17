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
  areaKm2?: number;
  shapeArea?: number;
  shapeLength?: number;
}

export const ANGOLA_PROVINCES_21: AngolaProvinceData[] = [
  { provinceCode: "CAB", geometryId: "CAB", name: "Cabinda", capital: "Cabinda", region: "Norte Enclave", isCapital: false, centerLng: 12.4777, centerLat: -5.0313, areaKm2: 7283, shapeArea: 7282980564.57, shapeLength: 598310.11 },
  { provinceCode: "ZAI", geometryId: "ZAI", name: "Zaire", capital: "Mbanza Kongo", region: "Norte", isCapital: false, centerLng: 13.5708, centerLat: -6.6104, areaKm2: 37983, shapeArea: 37983127900.64, shapeLength: 1103442.74 },
  { provinceCode: "UIG", geometryId: "UIG", name: "Uíge", capital: "Uíge", region: "Norte", isCapital: false, centerLng: 15.4742, centerLat: -7.0354, areaKm2: 63989, shapeArea: 63988681702.56, shapeLength: 1856569.26 },
  { provinceCode: "BGO", geometryId: "BGO", name: "Bengo", capital: "Caxito", region: "Norte", isCapital: false, centerLng: 14.0248, centerLat: -8.3265, areaKm2: 20880, shapeArea: 20879760807.82, shapeLength: 911862.26 },
  { provinceCode: "ICB", geometryId: "ICB", name: "Icolo e Bengo", capital: "Catete", region: "Litoral Norte", isCapital: false, centerLng: 13.8211, centerLat: -9.6813, areaKm2: 17763, shapeArea: 17763288704.85, shapeLength: 874210.12 },
  { provinceCode: "LUA", geometryId: "LUA", name: "Luanda", capital: "Luanda", region: "Litoral Norte", isCapital: true, centerLng: 13.2293, centerLat: -9.0294, areaKm2: 1699, shapeArea: 1698553851.68, shapeLength: 371208.29 },
  { provinceCode: "CNO", geometryId: "CNO", name: "Cuanza Norte", altName: "Cuanza-Norte", capital: "N'dalatando", region: "Norte", isCapital: false, centerLng: 14.9864, centerLat: -8.9706, areaKm2: 21119, shapeArea: 21118818801.45, shapeLength: 1071490.20 },
  { provinceCode: "CSU", geometryId: "CSU", name: "Cuanza Sul", altName: "Cuanza-Sul", capital: "Sumbe", region: "Centro", isCapital: false, centerLng: 15.0320, centerLat: -10.8267, areaKm2: 57991, shapeArea: 57991122061.18, shapeLength: 1601595.47 },
  { provinceCode: "MAL", geometryId: "MAL", name: "Malanje", capital: "Malanje", region: "Norte Interior", isCapital: false, centerLng: 17.0403, centerLat: -9.5387, areaKm2: 89802, shapeArea: 89801594040.33, shapeLength: 3137725.18 },
  { provinceCode: "LNO", geometryId: "LNO", name: "Lunda Norte", altName: "Lunda-Norte", capital: "Dundo", region: "Leste", isCapital: false, centerLng: 19.5730, centerLat: -8.5090, areaKm2: 101658, shapeArea: 101658132738.83, shapeLength: 2663554.93 },
  { provinceCode: "LSU", geometryId: "LSU", name: "Lunda Sul", altName: "Lunda-Sul", capital: "Saurimo", region: "Leste", isCapital: false, centerLng: 20.5699, centerLat: -10.1738, areaKm2: 85303, shapeArea: 85303327986.67, shapeLength: 2340603.57 },
  { provinceCode: "MOX", geometryId: "MOX", name: "Moxico", capital: "Luena", region: "Leste", isCapital: false, centerLng: 20.1746, centerLat: -13.3870, areaKm2: 133946, shapeArea: 133946205068.65, shapeLength: 2915488.94 },
  { provinceCode: "MXL", geometryId: "MXL", name: "Moxico Leste", altName: "Moxico-Leste", capital: "Cazombo", region: "Leste Fronteira", isCapital: false, centerLng: 22.4630, centerLat: -12.0211, areaKm2: 79027, shapeArea: 79027105225.99, shapeLength: 1967571.85 },
  { provinceCode: "BIE", geometryId: "BIE", name: "Bié", capital: "Cuito", region: "Planalto Central", isCapital: false, centerLng: 17.3350, centerLat: -12.3143, areaKm2: 74520, shapeArea: 74519551421.05, shapeLength: 2423897.08 },
  { provinceCode: "HUA", geometryId: "HUA", name: "Huambo", capital: "Huambo", region: "Planalto Central", isCapital: false, centerLng: 15.7373, centerLat: -12.5628, areaKm2: 35182, shapeArea: 35181641622.06, shapeLength: 1263244.37 },
  { provinceCode: "BEN", geometryId: "BEN", name: "Benguela", capital: "Benguela", region: "Litoral Centro", isCapital: false, centerLng: 13.9734, centerLat: -12.9500, areaKm2: 41498, shapeArea: 41498185580.87, shapeLength: 1285798.46 },
  { provinceCode: "HUI", geometryId: "HUI", name: "Huíla", capital: "Lubango", region: "Sul", isCapital: false, centerLng: 14.9408, centerLat: -14.7375, areaKm2: 84896, shapeArea: 84895521800.04, shapeLength: 2069334.72 },
  { provinceCode: "NAM", geometryId: "NAM", name: "Namibe", capital: "Moçâmedes", region: "Litoral Sul", isCapital: false, centerLng: 12.7199, centerLat: -15.5055, areaKm2: 61834, shapeArea: 61833581691.62, shapeLength: 1706481.58 },
  { provinceCode: "CUN", geometryId: "CUN", name: "Cunene", capital: "Ondjiva", region: "Sul Fronteira", isCapital: false, centerLng: 15.5693, centerLat: -16.5026, areaKm2: 84431, shapeArea: 84430554521.46, shapeLength: 1562019.34 },
  { provinceCode: "CCU", geometryId: "CCU", name: "Cubango", altName: "Cuando Cubango", capital: "Menongue", region: "Sudeste", isCapital: false, centerLng: 18.1099, centerLat: -15.7445, areaKm2: 99007, shapeArea: 99006800123.52, shapeLength: 2521615.06 },
  { provinceCode: "CND", geometryId: "CND", name: "Cuando", altName: "Quando", capital: "Mavinga", region: "Sudeste Fronteira", isCapital: false, centerLng: 20.6549, centerLat: -16.4099, areaKm2: 119132, shapeArea: 119131673706.69, shapeLength: 2681831.57 }
];
