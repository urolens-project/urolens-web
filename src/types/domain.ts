export interface ApiError {
  response?: {
    data?: {
      error?: {
        code?: string;
        message?: string | {
          error?: {
            code?: string;
            message?: string;
            details?: Record<string, unknown>;
          };
        };
      };
      detail?: string;
    };
  };
  message?: string;
}