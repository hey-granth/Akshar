import { z } from "zod";

const EnvSchema = z.object({
  HTTP_PORT: z.coerce.number().int().positive().default(4001),
  HOCUSPOCUS_PORT: z.coerce.number().int().positive().default(4002),
  AGENT_API_URL: z.string().url().default("http://localhost:8001"),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  UPSTASH_REDIS_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional()
});

export type AppEnv = z.infer<typeof EnvSchema>;

export function loadEnv(): AppEnv {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }
  return parsed.data;
}
