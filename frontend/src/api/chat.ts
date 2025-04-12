import { api } from "./config";

/**
 * 聊天历史相关 API
 */
export const chatApi = {
  /**
   * 添加聊天历史
   */
  addHistory: async (user_prompt: string, assistant_prompt: string) => {
    try {
      const response = await api.post(`/api/add_chat_history`, { 
        user_prompt, 
        assistant_prompt 
      });
      console.log(response.data);
      return response.data.results;
    } catch (error) {
      console.error("Error sending add_chat_history request:", error);
      throw error;
    }
  }
}; 