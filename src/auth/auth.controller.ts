import { Request,Response } from "express";
import { createUserService, getUserByEmailService, userLoginService, verifyUserService } from "./auth.service";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail } from "../mailer/mailer";


export const createUserController = async (req: Request, res: Response) => {
    try {
        const user = req.body;
        const password = user.password;
        const hashedPassword = bcrypt.hashSync(password, 10);
        user.password = hashedPassword

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verification_code = verificationCode;
        user.is_verified = false; // Set is_verified to false by default
        

        const createUser = await createUserService(user)
        

        if(!createUser) {
         
            return res.status(400).json({ message: "User creation failed" });
        }
        try {
            await sendMail(
                user.mail,
                "Email Verification",
                `Your verification code is: ${verificationCode}`,
                `<p>Your verification code is: <strong>${verificationCode}</strong></p>`

            )
            
        } catch (emailerror) {
            console.error("Error in createUserController:", emailerror);
            return res.status(500).json({ message: "Internal server error" });
            
        }
        return res.status(201).json({ message: "User created successfully", user: createUser });
        
        


        
    } catch (error) {
        console.error("Error in createUserController:", error);
        return res.status(500).json({ message: "Internal server error" });
        
    }
}

export const verifyUserController = async (req: Request, res: Response) => {
     const {email,code} = req.body;

    try {
        const user = await getUserByEmailService(email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.verification_code === code) {
            await verifyUserService(email);
           
        
        try {
            await sendMail(
                email,
                "Email Verification Successful",
                "Your email has been successfully verified.",
                "<p>Your email has been successfully verified.</p>"
            );
            return res.status(200).json({ message: "Email verified successfully" });
            
        } catch (error) {
            console.error("Error in verifyUserController:", error);
            return res.status(500).json({ message: "Internal server error" });
            
        }
    }else{
            
    }


       

        
    } catch (error) {
        console.error("Error in verifyUserController:", error);
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