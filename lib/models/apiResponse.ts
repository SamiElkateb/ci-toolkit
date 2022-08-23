type apiResponse<T> = {
  success: true;
  response: T;
} | {
  success: false;
  error: Error;
};

