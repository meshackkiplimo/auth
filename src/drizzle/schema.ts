
import { relations } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { pgEnum, timestamp } from "drizzle-orm/pg-core";
import { boolean } from "drizzle-orm/pg-core";
import { integer } from "drizzle-orm/pg-core";
import { pgTable,serial,varchar } from "drizzle-orm/pg-core";


export const RoleEnum =pgEnum ("role",["admin","user"] );

export const UsersTable = pgTable("users",{
    id: serial("id").primaryKey(),
    name:varchar("name").notNull(),
    last_name:varchar("last_name").notNull(),
    email:varchar("email").notNull().unique(),
    password:varchar("password").notNull(),
    role: RoleEnum("role").default("user"),
    
})

export const TodoTable = pgTable("todos",{
    id: serial("id").primaryKey(),
    userId:integer("user_id").notNull().references(() => UsersTable.id),
    todoName:varchar("todo_name").notNull(),
    createdAt:timestamp("created_at").defaultNow(), 
    dueDate:timestamp("due_date").notNull(),
    isCompleted:boolean("is_completed").default(false),
    description:varchar("description").notNull(),
});

export const UserRealtions = relations(UsersTable, ({ many }) => ({
    todo: many(TodoTable),
}));

export const TodoRelations = relations(TodoTable, ({ one }) => ({
    user: one(UsersTable, {
        fields: [TodoTable.userId],
        references: [UsersTable.id],
    }),
}));


// infer types

export type TIUser = typeof UsersTable.$inferInsert;
export type TsUser = typeof UsersTable.$inferSelect;
export type TITodo = typeof TodoTable.$inferInsert;
export type TSTodo = typeof TodoTable.$inferSelect;
export type role= string | "admin" | "user";