import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  KEY_ENC_SECRET: z.string().min(16, 'KEY_ENC_SECRET must be at least 16 characters'),
  ETH_NETWORK: z.string().default('sepolia'),
  XRPL_NETWORK: z.string().default('testnet'),
  USE_SIMULATION: z.string().transform(val => val === 'true').default('true'),
  
  // Optional API keys for real providers
  CIRCLE_API_KEY: z.string().optional(),
  CIRCLE_BASE: z.string().url().default('https://api-sandbox.circle.com'),
  USDT_API_KEY: z.string().optional(),
  USDT_API_BASE: z.string().url().optional(),
  GIFTBIT_API_KEY: z.string().optional(),
  GIFTBIT_API_BASE: z.string().url().optional(),
  
  // Database
  POSTGRES_URL: z.string().url().optional(),
  POSTGRES_PRISMA_URL: z.string().url().optional(),
  DATABASE_URL: z.string().url().optional(),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default('Wallet MVP'),
});

function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    const publicEnv = publicEnvSchema.parse(process.env);
    
    return { env, publicEnv };
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}

const { env, publicEnv } = validateEnv();

export { env, publicEnv };