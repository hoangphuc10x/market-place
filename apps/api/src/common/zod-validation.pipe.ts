import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

/**
 * Validates incoming request payloads against a Zod schema.
 * Throws ZodError -> caught by AllExceptionsFilter -> 400 with structured details.
 */
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown, _metadata: ArgumentMetadata): T {
    try {
      return this.schema.parse(value);
    } catch (e) {
      if (e instanceof ZodError) throw e;
      throw new BadRequestException('Invalid input');
    }
  }
}
