import {createTodoService,getTodosService,updateTodoService,deleteTodoService,getTodoByIdService } from "../../src/todo/todo.service"
import db from "../../src/drizzle/db";
import { TITodo, TodoTable } from "../../src/drizzle/schema";

jest.mock("../../src/drizzle/db", () => ({
    insert:jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    query:{
        TodoTable: {
            findFirst: jest.fn(),
            findMany: jest.fn()
        }
    }
}))

beforeEach(() => {

    jest.clearAllMocks();
})

describe("Todo Service", () => {

    describe("createTodoService", () => {
        it("should insert a todo and retun inserted tod",async () => {
            const todo = {
               todoName: "Test Todo",
                userId: 1,
                isCompleted: false,
                dueDate: new Date(),
                description: "Test description"
            }
            const inserted = {id:1, ...todo};
            (db.insert as jest.Mock).mockReturnValue({
                values:jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([inserted])

                })

            })
            const result = await createTodoService(todo);
            expect(db.insert).toHaveBeenCalledWith(TodoTable);
            expect(result).toEqual(inserted);

            
        })
        it("should return null if insertion fails", async () => {
            const todo = {
                todoName: "Test Todo",
                userId: 1,
                isCompleted: false,
                dueDate: new Date(),
                description: "Test description"
            };
            
            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([null])
                })
            });

            const result = await createTodoService(todo);
            expect(result).toBeNull();
        });

        it("should handle database errors", async () => {
            const todo = {
                todoName: "Test Todo",
                userId: 1,
                isCompleted: false,
                dueDate: new Date(),
                description: "Test description"
            };
            
            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockRejectedValueOnce(new Error("Database error"))
                })
            });

            await expect(createTodoService(todo)).rejects.toThrow("Database error");
        });

})

describe("getTodosService", () => {
    it("should return all todos", async () => {
        const todos = [
            { id: 1, todoName: "Todo 1", userId: 1, isCompleted: false, dueDate: new Date(), description: "Description 1" },
            { id: 2, todoName: "Todo 2", userId: 1, isCompleted: true, dueDate: new Date(), description: "Description 2" }
        ];

        (db.query.TodoTable.findMany as jest.Mock).mockResolvedValue(todos);
        const result = await getTodosService();
        expect(db.query.TodoTable.findMany).toHaveBeenCalled();
        expect(result).toEqual(todos);
    });

    it("should return an empty array if no todos found", async () => {
        (db.query.TodoTable.findMany as jest.Mock).mockResolvedValue([]);
        const result = await getTodosService();
        expect(db.query.TodoTable.findMany).toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
        (db.query.TodoTable.findMany as jest.Mock).mockRejectedValue(new Error("Database error"));
        await expect(getTodosService()).rejects.toThrow("Database error");
    });
});

describe("getTodoByIdService", () => {
    it("should return a todo by id", async () => {
        const todo = {
            id: 1,
            todoName: "Todo 1",
            userId: 1,
            isCompleted: false,
            dueDate: new Date(),
            description: "Description 1"
        };

        (db.query.TodoTable.findFirst as jest.Mock).mockResolvedValue(todo);
        const result = await getTodoByIdService(1);
        expect(db.query.TodoTable.findFirst).toHaveBeenCalledWith({
            where: expect.any(Object)
        });
        expect(result).toEqual(todo);
    });

    it("should return null if todo not found", async () => {
        const todoId = 99999;
        (db.query.TodoTable.findFirst as jest.Mock).mockResolvedValue(null);
        const result = await getTodoByIdService(todoId);
        expect(db.query.TodoTable.findFirst).toHaveBeenCalledWith({
            where: expect.any(Object)
        });
        expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
        (db.query.TodoTable.findFirst as jest.Mock).mockRejectedValue(new Error("Database error"));
        await expect(getTodoByIdService(1)).rejects.toThrow("Database error");
    });
});

describe("updateTodoService", () => {
    it("should update todo and return success message with updated todo", async () => {
        const updateData = {
            userId: 1,
            todoName: "Updated Todo",
            isCompleted: true,
            dueDate: new Date(),
            description: "Updated description"
        };
        const updatedTodo = { id: 1, ...updateData };
        
        (db.update as jest.Mock).mockReturnValue({
            set: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            returning: jest.fn().mockResolvedValueOnce([updatedTodo])
        });

        const result = await updateTodoService(1, updateData);
        expect(db.update).toHaveBeenCalledWith(TodoTable);
        expect(result).toEqual({
            message: "Todo updated successfully",
            todo: updatedTodo
        });
    });

    it("should return not found message when updating non-existent todo", async () => {
        (db.update as jest.Mock).mockReturnValue({
            set: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            returning: jest.fn().mockResolvedValueOnce([])
        });

        const result = await updateTodoService(999, {
            userId: 1,
            todoName: "Updated Todo",
            isCompleted: true,
            dueDate: new Date(),
            description: "Updated description"
        });
        expect(result).toEqual({ message: "Todo not found" });
    });

    it("should handle database errors during update", async () => {
        (db.update as jest.Mock).mockReturnValue({
            set: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            returning: jest.fn().mockRejectedValueOnce(new Error("Database error"))
        });

        await expect(updateTodoService(1, {
            userId: 1,
            todoName: "Updated Todo",
            isCompleted: true,
            dueDate: new Date(),
            description: "Updated description"
        })).rejects.toThrow("Database error");
    });
})
describe("deleteTodoService", () => {
    it("should delete a todo and return success message", async () => {
        const deletedTodo = { id: 1, todoName: "Deleted Todo" };
        
        (db.delete as jest.Mock).mockReturnValue({
            where: jest.fn().mockReturnThis(),
            returning: jest.fn().mockResolvedValueOnce([deletedTodo])
        });

        const result = await deleteTodoService(1);
        expect(db.delete).toHaveBeenCalledWith(TodoTable);
        expect(result).toEqual({ message: "Todo deleted successfully" });
    });

    it("should return not found message when deleting non-existent todo", async () => {
        (db.delete as jest.Mock).mockReturnValue({
            where: jest.fn().mockReturnThis(),
            returning: jest.fn().mockResolvedValueOnce([])
        });

        const result = await deleteTodoService(999);
        expect(result).toEqual({ message: "Todo not found" });
    });

    it("should handle database errors during deletion", async () => {
        (db.delete as jest.Mock).mockReturnValue({
            where: jest.fn().mockReturnThis(),
            returning: jest.fn().mockRejectedValueOnce(new Error("Database error"))
        });

        await expect(deleteTodoService(1)).rejects.toThrow("Database error");
    });
});

})