export interface ApiError {
  response?: {
    data?: {
      error?: {
        code?: string;
        message?: string;
      };
      detail?: string;
    };
  };
  message?: string;
}
