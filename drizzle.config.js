import { defineConfig } from "drizzle-kit";

 
export default defineConfig({
  schema: "./configs/schema.js",
  out: "./configs/migrations",
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://neondb_owner:Pwb50yejlnAV@ep-bitter-frog-a5fs7rqu.us-east-2.aws.neon.tech/ayush-galaxy?sslmode=require',
  }
});
