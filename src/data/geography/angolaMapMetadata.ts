export interface AngolaMapMetadata {
  dataset: string;
  version: string;
  administrativeLevel: string;
  provinceCount: number;
  effectiveDate: string;
  source: string;
  projection: string;
  checksum: string;
}

export const ANGOLA_MAP_METADATA: AngolaMapMetadata = {
  dataset: "angola-national-provinces-2024",
  version: "2.1.0-OPERATIONAL",
  administrativeLevel: "PROVINCIAL_LEVEL_1",
  provinceCount: 21,
  effectiveDate: "2024-2026",
  source: "PNAP-AO Divisão Político-Administrativa de Angola (MININT/IGCA)",
  projection: "EPSG:4326 / WGS 84 (Mercator)",
  checksum: "sha256-ao-dpa2024-21provs-v2"
};
