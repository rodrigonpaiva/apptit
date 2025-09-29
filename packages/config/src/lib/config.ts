import dotenvFlow from 'dotenv-flow';
import { z } from 'zod';

dotenvFlow.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().optional(),
  KAFKA_BROKERS: z.string().optional(),
  OPENFOODFACTS_BASE_URL: z.string().url().default('https://world.openfoodfacts.org'),
});

export const cfg = schema.parse(process.env);
