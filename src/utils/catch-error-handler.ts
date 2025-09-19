import { Response } from 'express';

export const getErrorStatus = (error: Error): number => {
  if (
    error.cause &&
    typeof error.cause === 'object' &&
    'status' in error.cause
  ) {
    return error.cause.status as number;
  }
  return 500;
};

export const handleControllerError = (res: Response, error: unknown): void => {
  if (error instanceof Error) {
    const errorStatus = getErrorStatus(error);
    res.status(errorStatus).json({
      success: false,
      status: errorStatus,
      message: error.message || 'An error occurred during authentication.'
    });
    return;
  } else {
    res.status(500).json({
      success: false,
      status: 500,
      message: 'Internal server error. Please try again later.'
    });
    return;
  }
};
