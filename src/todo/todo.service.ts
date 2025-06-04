import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { TITodo,TodoTable } from "../drizzle/schema";


export const createTodoService = async (todo:TITodo) => {
    try {
        const [inserted] = await db.insert(TodoTable).values(todo).returning();
        return inserted || null;
    } catch (error) {
        throw error;
    }
}

export const getTodosService = async () => {
    try {
        const todos = await db.query.TodoTable.findMany();
        return todos;
    } catch (error) {
        throw error;
    }
}

export const getTodoByIdService = async (id: number) => {
    try {
        const todo = await db.query.TodoTable.findFirst({
            where: eq(TodoTable.id, id),
        });
        return todo;
    } catch (error) {
        throw error;
    }
}

export const updateTodoService = async (id: number, todo: TITodo) => {
    try {
        const updateData = {
            ...todo,
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
        };

        const [updated] = await db.update(TodoTable)
            .set(updateData)
            .where(eq(TodoTable.id, id))
            .returning();
        
        if (!updated) {
            return { message: "Todo not found" };
        }
        
        return { message: "Todo updated successfully", todo: updated };
    } catch (error) {
        throw error;
    }
}

export const deleteTodoService = async (id: number) => {
    try {
        const [deleted] = await db.delete(TodoTable)
            .where(eq(TodoTable.id, id))
            .returning();
        
        if (!deleted) {
            return { message: "Todo not found" };
        }
        
        return { message: "Todo deleted successfully" };
    } catch (error) {
        throw error;
    }
}