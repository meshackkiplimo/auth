import {createTodoService,getTodosService,updateTodoService,deleteTodoService,getTodoByIdService } from "../../src/todo/todo.service"
import db from "../../src/drizzle/db";
import { TITodo, TodoTable } from "../../src/drizzle/schema";

jest.mock("../src/drizzle/db" ,()=>({
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
        it("should return null if insertion failes",async () =>{
            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([null])
                })
            })
            
        })



})

describe("gettodo service",()=>{
    it("should return all todos",async () => {
        const todos = [
            { id: 1, todoName: "Todo 1", userId: 1, isCompleted: false, dueDate: new Date(), description: "Description 1" },
            { id: 2, todoName: "Todo 2", userId: 1, isCompleted: true, dueDate: new Date(), description: "Description 2" }
        ];

        (db.query.TodoTable.findMany as jest.Mock).mockResolvedValue(todos);
        const result = await getTodosService();
        expect(db.query.TodoTable.findMany).toHaveBeenCalled();
        expect(result).toEqual(todos);

        
    })
    it("should return an empty array if no todos found",async () => {
        (db.query.TodoTable.findMany as jest.Mock).mockResolvedValue([]);
        const result = await getTodosService();
        expect(db.query.TodoTable.findMany).toHaveBeenCalled();
        expect(result).toEqual([]);
        
    })
})

describe("getTodoByIdService",()=>{
   it("should return a todo by id",async () => {
    

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
    expect(db.query.TodoTable.findFirst).toHaveBeenCalled()
    expect(result).toEqual(todo);




   }


)
    it("should return null if todo not found",async () => {
     const todoId = 99999; // Non-existent ID
     (db.query.TodoTable.findFirst as jest.Mock).mockResolvedValue(null);
     const result = await getTodoByIdService(todoId);
     expect(db.query.TodoTable.findFirst).toHaveBeenCalled();
     expect(result).toBeNull();
     
    })


})

describe("updateTodoService", () => {
    it("it should update todo and return a success message",async () => {
        (db.update as jest.Mock).mockReturnValue({
            where: jest.fn().mockResolvedValueOnce(undefined)

            
           
        });
       const result = await updateTodoService(1, {

            userId: 1,
            todoName: "Updated Todo",
            isCompleted: true,
            dueDate: new Date(),
            description: "Updated description"
        });
        expect(db.update).toHaveBeenCalledWith(TodoTable);
        expect(result).toEqual({ message: "Todo updated successfully" });
        
    })



})
describe("deleteTodoService", () => {
    it("should delete a todo and return a success message",async () => {
        (db.delete as jest.Mock).mockReturnValue({
            where: jest.fn().mockResolvedValueOnce(undefined)
        });
        const result = await deleteTodoService(1);
        expect(db.delete).toHaveBeenCalledWith(TodoTable);
        expect(result).toEqual({ message: "Todo deleted successfully" });
        
    })

    
})



})