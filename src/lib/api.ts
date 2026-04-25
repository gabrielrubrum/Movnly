import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "./auth-store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    // Prestige Error Mapping
    let userMessage = "Ocorreu um erro inesperado. Por favor, tente novamente.";

    if (status === 401) {
      userMessage = "Sessão Expirada. Por favor, realize o login novamente para continuar.";
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } else if (status === 403) {
      userMessage = "Acesso Restrito. Não possui permissões para realizar esta operação.";
    } else if (status === 404) {
      userMessage = "Recurso não encontrado no servidor.";
    } else if (status >= 500) {
      userMessage = "Estamos a enfrentar uma instabilidade temporária. A nossa equipa técnica já foi notificada.";
    } else if (message) {
      // Use backend message if provided, but filtered for tech jargon
      userMessage = message.includes("Prisma") || message.includes("SQL") 
        ? "Erro de processamento de dados. Por favor, valide as informações."
        : message;
    }

    // Show Toast
    if (typeof window !== "undefined") {
        toast.error("Protocolo de Erro", {
            description: userMessage,
            duration: 5000,
        });
    }

    return Promise.reject(error);
  }
);

export default api;
