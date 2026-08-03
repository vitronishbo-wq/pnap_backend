
export const apiService = {
  getHealthRecords: async () => [],
  getReintegrationRecords: async () => [],
  getIntelligenceRecords: async () => [],
  addHealthRecord: async (rec: any) => rec,
  createHealthRecord: async (rec: any) => rec,
  updateHealthRecord: async (id: any, rec: any) => rec,
  deleteHealthRecord: async (id: any) => true,
  addReintegrationRecord: async (rec: any) => rec,
  createReintegrationRecord: async (rec: any) => rec,
  updateReintegrationRecord: async (id: any, rec: any) => rec,
  deleteReintegrationRecord: async (id: any) => true,
  addIntelligenceRecord: async (rec: any) => rec,
};
