import { sql } from "drizzle-orm";
import db from "../drizzle/db";
import { TIUser } from "../drizzle/schema";
import { UsersTable } from "../drizzle/schema";
// create a new user

export const createUserService = async (user:TIUser) => {
    const newUser = await db.insert(UsersTable).values(user).returning();
    return newUser[0];
}

export const userLoginService = async (user: TIUser) => {
    const { email } = user;

    return await db.query.UsersTable.findFirst({
        columns: {
            id: true,
            name: true,
            last_name: true,
            email: true,
            password: true
        }, where: sql`${UsersTable.email} = ${email}`
    })
}