import { Express } from "express";

import { createUserController, userLoginController, verifyUserController } from "./auth.controller";
import { checkRoles } from "../middleware/bearAuth";

export const user = (app: Express) => {
    app.route("/auth/register").post(
        async (req, res,next) => {
            try {
                await createUserController(req, res);

                
            } catch (error) {
                next(error);
                
            }

        }
    )

    app.route("/auth/verify").post(
        async (req, res,next) => {
            try {
                await verifyUserController(req, res);
                
            } catch (error) {
                next(error);
                
            }
        }
    )
    app.route("/auth/login").post(
        
        
        async (req, res,next) => {
            try {
                await userLoginController(req, res);
                
            } catch (error) {
                next(error);
                
            }
        }
    )
}
