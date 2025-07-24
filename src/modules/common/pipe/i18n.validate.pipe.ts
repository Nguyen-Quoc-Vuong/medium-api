import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class I18nValidationPipe implements PipeTransform {
  constructor(private readonly i18n: I18nService) {}

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const errorMessages: string[] = [];

      for (const error of errors) {
        const constraints = Object.values(error.constraints || {});
        for (const constraint of constraints) {
          if (typeof constraint === 'string') {
            // Translate the error message using i18n
            const translatedMessage = await this.i18n.translate(constraint);
            errorMessages.push(String(translatedMessage));
          }
        }
      }

      throw new BadRequestException({
        message: errorMessages,
        error: 'Bad Request',
        statusCode: 400,
      });
    }

    return value;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
