import { Response } from 'express';
import { HttpStatus } from '@shared/constants/enums';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export class ResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = HttpStatus.OK
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message?: string): Response {
    return this.success(res, data, message, HttpStatus.CREATED);
  }

  static error(
    res: Response,
    code: string,
    message: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
    details?: unknown
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    currentPage: number,
    totalItems: number,
    itemsPerPage: number,
    message?: string
  ): Response {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const response: ApiResponse<PaginatedResponse<T>> = {
      success: true,
      data: {
        data,
        pagination: {
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
        },
      },
      message,
      timestamp: new Date().toISOString(),
    };

    return res.status(HttpStatus.OK).json(response);
  }
}
