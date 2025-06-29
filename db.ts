import { config } from "dotenv";
import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./src/db/schema"

config({ path: ".env" });

const drizzleClient = drizzle(
  postgres(process.env.DATABASE_URL!, {
    prepare: false,
  }),
  { schema },
);

declare global {
  var database: PostgresJsDatabase<typeof schema> | undefined;
}

export const db = global.database || drizzleClient;
if (process.env.NODE_ENV !== "production") global.database = db;
