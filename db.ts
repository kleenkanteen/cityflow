import "dotenv/config";
import * as schema from "./src/db/schema.ts"
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL!, schema: {});