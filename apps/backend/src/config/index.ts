import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

export const AppConfig = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
  validationSchema: Joi.object({
    PORT: Joi.number().default(3000),
    MONGODB_URI: Joi.string().required(),
    AZURE_ADT_ENDPOINT: Joi.string().required(),

    AZURE_TENANT_ID: Joi.string().required(),
    AZURE_CLIENT_ID: Joi.string().required(),
    AZURE_CLIENT_SECRET: Joi.string().required(),
    AZURE_SUBSCRIPTION_ID: Joi.string().required(),
    AZURE_RESOURCE_GROUP: Joi.string().required(),
    AZURE_REGION: Joi.string().required(),

    JWT_SECRET: Joi.string().required(),
  }),
});
