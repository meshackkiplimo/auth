
import { Request, Response } from "express";
import { createTodoService, deleteTodoService, getTodoByIdService, getTodosService, updateTodoService } from "./todo.service";




export const createTodoController = async (req:Request,res:Response) => {

    try {
        const todo = req.body;
       if (todo.dueDate){
        todo.dueDate = new Date(todo.dueDate);
       }
       const newTodo = await createTodoService(todo);
        if (!newTodo) {
            return res.status(400).json({ message: "Todo creation failed" });
        }
        return res.status(201).json({ message: "Todo created successfully", todo: newTodo });

    } catch (error) {
        
        console.error("Error in createTodoController:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
    
}

export const getAllTodosController = async (req: Request, res: Response) => {
    try {
        const todos = await getTodosService();
        if (!todos || todos.length === 0) {
            return res.status(404).json({ message: "No todos found" });
        }
        return res.status(200).json({ todos });

        
    } catch (error) {
        console.error("Error in getAllTodosController:", error);
        return res.status(500).json({ message: "Internal server error" });
        
    }
}

export const getTodoByIdController = async (req: Request, res: Response) => {
    try {
       const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID format" });

        }
        const todo = await getTodoByIdService(id);
        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        return res.status(200).json({ todo });

        
       

    } catch (error) {
        console.error("Error in getTodoByIdController:", error);
        return res.status(500).json({ message: "Internal server error" });
        
    }
}

export const updateTodoController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        const todo = req.body;
        if (todo.dueDate && typeof todo.dueDate === 'string') {
            const date = new Date(todo.dueDate);
            if (isNaN(date.getTime())) {
                return res.status(400).json({ message: "Invalid date format" });
            }
            todo.dueDate = date;
        }
        const existingTodo = await getTodoByIdService(id);
        if (!existingTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        const updatedTodo = await updateTodoService(id, todo);
        if (!updatedTodo) {
            return res.status(400).json({ message: "Todo update failed" });
        }
        return res.status(200).json({
            message: "Todo updated successfully",
            todo: updatedTodo
        });

    } catch (error) {
        console.error("Error in updateTodoController:", error);
        return res.status(500).json({ message: "Internal server error" });
        
    }
    
}

export const deleteTodoController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        const existingTodo = await getTodoByIdService(id);
        if (!existingTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        
        const deletedMessage = await deleteTodoService(id);
        return res.status(200).json({ message: deletedMessage });

    } catch (error) {
        console.error("Error in deleteTodoController:", error);
        return res.status(500).json({ message: "Internal server error" });
        
    }
}