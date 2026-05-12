import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@threadly/db';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof ZodError) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        code: 'VALIDATION_FAILED',
        message: exception.issues[0]?.message ?? 'Invalid input',
        details: exception.issues,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : ((body as { message?: string }).message ?? exception.message);
      const code = (body as { code?: string }).code ?? `HTTP_${status}`;
      return res.status(status).json({ code, message });
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        return res.status(HttpStatus.CONFLICT).json({
          code: 'UNIQUE_CONSTRAINT',
          message: 'Resource already exists',
          details: exception.meta,
        });
      }
      if (exception.code === 'P2025') {
        return res.status(HttpStatus.NOT_FOUND).json({
          code: 'NOT_FOUND',
          message: 'Resource not found',
        });
      }
    }

    this.logger.error('Unhandled exception', exception as Error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
    });
  }
}
