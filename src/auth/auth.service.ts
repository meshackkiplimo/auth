import { sql } from "drizzle-orm";
import db from "../drizzle/db";
import { TIUser } from "../drizzle/schema";
import { UsersTable } from "../drizzle/schema";

export const createUserService = async (user:TIUser) => {
    const newUser = await db.insert(UsersTable).values(user).returning();
    return newUser[0];
}

export const verifyUserService = async (email: string) => {
    await db.update(UsersTable)
        .set({
            is_verified: true,
            verification_code: null // Clear the verification code after successful verification
        })
        .where(sql`${UsersTable.email} = ${email}`);
}

export const userLoginService = async (user: TIUser) => {
    const { email } = user;

    return await db.query.UsersTable.findFirst({
        columns: {
            id: true,
            name: true,
            last_name: true,
            email: true,
            password: true,
            role: true,
            is_verified: true
        }, 
        where: sql`${UsersTable.email} = ${email}`
    });
}

export const getUserByEmailService = async (email: string) => {
    return await db.query.UsersTable.findFirst({
        columns: {
            id: true,
            name: true,
            last_name: true,
            email: true,
            password: true,
            role: true,
            is_verified: true,
            verification_code: true
        },
        where: sql`${UsersTable.email} = ${email}`
    });
}