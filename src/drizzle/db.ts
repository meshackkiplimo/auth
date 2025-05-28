import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

import {Client} from "pg";
import * as schema from "./schema";


export const client = new Client({
  connectionString: process.env.DATABASE_URL as string,
});

const main = async () => {
    await client.connect();
   
    
    }
main().catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
});


 const db = drizzle(client, { schema , logger: true });
export default db;
