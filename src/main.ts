declare const module: any;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { I18nService } from 'nestjs-i18n';
import { I18nValidationPipe } from '../src/modules/common/pipe/i18n.validate.pipe';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const i18n = app.get(I18nService) as I18nService<Record<string, unknown>>;

  app.useGlobalPipes(new I18nValidationPipe(i18n));
  await app.listen(process.env.PORT ?? 3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
