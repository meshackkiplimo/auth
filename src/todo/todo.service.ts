import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { TITodo,TodoTable } from "../drizzle/schema";


export const createTodoService = async (todo:TITodo) => {

    const [inserted]= await db.insert(TodoTable).values(todo).returning();
    if(inserted) {
        return inserted;
    }
    
}

export const getTodosService = async () => {
    const todos = await db.query.TodoTable.findMany()
    return todos;
}

export const getTodoByIdService = async (id: number) => {
    const todo = await db.query.TodoTable.findFirst({
        where: eq(TodoTable.id, id),
    });
    return todo;
}


export const updateTodoService = async (id: number, todo: TITodo) => {
    const updateData = {
        ...todo,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
    };

    const [updated] = await db.update(TodoTable)
        .set(updateData)
        .where(eq(TodoTable.id, id))
        .returning();
    
    return updated;
}

export const deleteTodoService = async (id: number) => {
    const deleted = await db.delete(TodoTable)
        .where(eq(TodoTable.id, id))
        
}