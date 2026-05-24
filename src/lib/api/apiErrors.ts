import { getVietnameseErrorMessage } from '@/lib/i18n/errorMessages';

export interface ApiErrorOptions {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details: unknown;
  userMessage: string;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.userMessage = getVietnameseErrorMessage(options.code, options.message);
  }
}
