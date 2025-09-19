import { NextFunction, Request, Response } from 'express';
import { AnySchema, ValidationError } from 'yup';

export const validate =
  (schema: AnySchema) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.validate(
        {
          body: req.body,
          query: req.query,
          params: req.params
        },
        { abortEarly: false }
      ); // abortEarly: false collects all errors
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.inner.map((err) => ({
            field: err.path,
            message: err.message
          }))
        });
        return;
      }
      next(error);
    }
  };
