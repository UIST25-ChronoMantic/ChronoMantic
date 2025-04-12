import { QuerySpec, QuerySpecWithSource, Segment, Intentions } from "../types/QuerySpec";
import { ApproximationResults } from "../types";
import { api } from "./config";

/**
 * 查询相关 API
 */
export const queryApi = {
  /**
   * 获取查询规范
   */
  getQuerySpec: async (nl_query: string): Promise<QuerySpecWithSource> => {
    console.log("Sending query spec request");
    try {
      const response = await api.post(`/api/parse_nl_query`, { nl_query });
      console.log(response.data);
      return response.data.results;
    } catch (error) {
      console.error("Error sending query spec request:", error);
      throw error;
    }
  },

  /**
   * 根据规范获取片段
   */
  getFragmentsBySpec: async (querySpec: QuerySpec): Promise<ApproximationResults> => {
    console.log("Sending fragments request");
    try {
      const response = await api.post(`/api/query_by_specification`, { querySpec });
      console.log(response.data);
      return response.data.results;
    } catch (error) {
      console.error("Error sending fragments request:", error);
      throw error;
    }
  },

  /**
   * 修改查询提示
   */
  modifyQuerySpec: async (
    old_queryspec_with_source: QuerySpecWithSource | null, 
    segments: Segment[], 
    intentions: Intentions
  ): Promise<QuerySpecWithSource> => {
    console.log("Sending modify_nl_query request");
    try {
      const response = await api.post(`/api/modify_nl_query`, { 
        old_queryspec_with_source, 
        segments, 
        intentions 
      });
      console.log(response.data);
      return response.data.results;
    } catch (error) {
      console.error("Error sending modify_prompt request:", error);
      throw error;
    }
  },

  /**
   * 获取segment比较结果
   */
  getSegmentComparison: async (segments: Segment[], ids?: [number, number][]) => {
    console.log("Sending segment comparison request");
    try {
      const response = await api.post(`/api/segment_comparison`, { segments, ids });
      console.log(response.data);
      return response.data.results;
    } catch (error) {
      console.error("Error sending segment comparison request:", error);
      throw error;
    }
  }
}; 