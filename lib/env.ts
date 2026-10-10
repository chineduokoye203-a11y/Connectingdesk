import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/connectdesk"),
  AUTH_SECRET: z.string().min(1).default("connectdesk-super-secret-auth-key-change-in-prod"),
  AUTH_URL: z.string().url().optional().default("http://localhost:3000"),
  OPENAI_API_KEY: z.string().optional().default("sk-dummy-key-for-dev"),
  OPENAI_MODEL: z.string().default("gpt-4o"),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
