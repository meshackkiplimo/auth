import { createTodoController, getAllTodosController, getTodoByIdController, updateTodoController } from "./todo.controller";

import { Express } from "express";


const todo = (app: Express) => {
    app.route("/todo").post(
        async (req, res, next) => {
            try {
                await createTodoController(req, res);
            } catch (error) {
                next(error);
            }
        }
    )
    app.route("/todos").get(
        async (req, res, next) => {
            try {
                await getAllTodosController(req, res);
            } catch (error) {
                next(error);
            }
        }
    )

    app.route("/todo/:id").get(
        async (req, res, next) => {
            try {
                await getTodoByIdController(req, res);
            } catch (error) {
                next(error);
            }
        }
    )
    app.route("/todo/:id").put(
        async (req, res, next) => {
            try {
                await updateTodoController(req, res);
            } catch (error) {
                next(error);
            }
        }
    )
    app.route("/todo/:id").delete(
        async (req, res, next) => {
            try {
                
                
                res.status(501).json({ message: "Delete functionality not implemented yet" });
            } catch (error) {
                next(error);
            }
        }
    )

}

export default todo;