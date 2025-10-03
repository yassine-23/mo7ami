import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API Error:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Network Error:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Chat API
export const chatApi = {
  sendMessage: async (message: string, language: string, conversationId?: string) => {
    const response = await apiClient.post("/api/v1/chat", {
      message,
      language,
      conversation_id: conversationId,
    });
    return response.data;
  },

  getHistory: async (userId: string) => {
    const response = await apiClient.get("/api/v1/chat/history", {
      params: { user_id: userId },
    });
    return response.data;
  },

  deleteConversation: async (conversationId: string) => {
    const response = await apiClient.delete(`/api/v1/chat/history/${conversationId}`);
    return response.data;
  },
};

// Voice API
export const voiceApi = {
  transcribe: async (audioBlob: Blob, language: string) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    const response = await apiClient.post("/api/v1/voice/transcribe", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: { language },
    });
    return response.data;
  },

  synthesize: async (text: string, language: string, voice: string = "female", speed: number = 1.0) => {
    const response = await apiClient.post(
      "/api/v1/voice/synthesize",
      {
        text,
        language,
        voice,
        speed,
      },
      {
        responseType: "blob",
      }
    );
    return response.data;
  },

  listVoices: async (language?: string) => {
    const response = await apiClient.get("/api/v1/voice/voices", {
      params: { language },
    });
    return response.data;
  },
};

// Documents API
export const documentsApi = {
  list: async (domain?: string, skip: number = 0, limit: number = 50) => {
    const response = await apiClient.get("/api/v1/documents", {
      params: { domain, skip, limit },
    });
    return response.data;
  },

  get: async (documentId: string) => {
    const response = await apiClient.get(`/api/v1/documents/${documentId}`);
    return response.data;
  },

  listDomains: async () => {
    const response = await apiClient.get("/api/v1/documents/domains");
    return response.data;
  },
};
