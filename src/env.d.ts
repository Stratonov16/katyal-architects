interface CloudflareEnv {
  DB: D1Database;
  BUCKET: R2Bucket;
  R2_PUBLIC_URL: string;
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
  JWT_SECRET: string;
}
