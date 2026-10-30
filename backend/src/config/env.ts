import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET debe tener al menos 10 caracteres'),
  JWT_EXPIRES_IN: z.string().default('1h'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  port: parseInt(parsed.data.PORT, 10),
  jwtSecret: parsed.data.JWT_SECRET,
  jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
};
