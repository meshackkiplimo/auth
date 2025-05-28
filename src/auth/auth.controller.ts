import { Request,Response } from "express";
import { createUserService, userLoginService } from "./auth.service";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const createUserController = async (req: Request, res: Response) => {
    try {
        const user = req.body;
        const password = user.password;
        const hashedPassword = bcrypt.hashSync(password, 10);
        user.password = hashedPassword
        const createUser = await createUserService(user)

        if(!createUser) {
            return res.status(400).json({ message: "User creation failed" });
        }
        return res.status(201).json({ message: "User created successfully", user: createUser });
        
        


        
    } catch (error) {
        console.error("Error in createUserController:", error);
        return res.status(500).json({ message: "Internal server error" });
        
    }
}

export const userLoginController = async (req: Request, res: Response) => {
    try {
        const user = req.body;
        const userExist = await userLoginService(user);
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }
        const userMatch = await bcrypt.compareSync(user.password, userExist.password);
        if (!userMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const payload ={
        sub: userExist.id,
        user_id: userExist.id,
        first_name: userExist.name,
        last_name: userExist.last_name,
        role:userExist.role,
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // Token expires in 1 hour
        
    }
        // Here you would typically generate a JWT token using a library like jsonwebtoken
        const secret =process.env.JWT as string;
        if (!secret) {

            throw new Error("JWT secret is not defined");
        }
        const token = jwt.sign(payload, secret);
        return res.status(200).json(
            { 
                message: "Login successful", 
                
                user: {
                    id: userExist.id,
                    first_name: userExist.name,
                    last_name: userExist.last_name,
                    email: userExist.email
                }, 
                token 



            });


        
    } catch (error) {
        console.error("Error in userLoginController:", error);
        return res.status(500).json({ message: "Internal server error" });
        
    }
    
}