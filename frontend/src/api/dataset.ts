import { DatasetInfo, ApproximationSegmentsContainers } from "../types";
import { api } from "./config";

/**
 * 数据集相关 API
 */
export const datasetApi = {
  /**
   * 上传 CSV 文件
   */
  uploadCsvFile: async (file: File) => {
    console.log("Sending csv file:", file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/api/upload_csv_file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error sending csv file:", error);
      throw error;
    }
  },

  /**
   * 处理数据集
   */
  processDataset: async (datasetInfo: DatasetInfo): Promise<ApproximationSegmentsContainers> => {
    console.log("Sending process dataset request");
    try {
      const response = await api.post(`/api/process_dataset`, { datasetInfo });
      console.log(response.data);
      return response.data.approximationSegmentsContainers;
    } catch (error) {
      console.error("Error sending process dataset request:", error);
      throw error;
    }
  }
}; 