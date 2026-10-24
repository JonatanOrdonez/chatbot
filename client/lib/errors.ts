import { isAxiosError } from 'axios';

export const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    return error.response?.data?.message ?? error.message;
  }

  return 'Something went wrong';
};
