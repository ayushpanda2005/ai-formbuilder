import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless" ;
import { config } from "dotenv"

config({path:".env.local"})
import * as schema from "./schema.js"
const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL_CONFIG)
 const db = drizzle(sql , {schema})

 export { db }
