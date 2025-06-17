import { Request,Response } from "express";
import { createUserService, getUserByEmailService, userLoginService, verifyUserService } from "./auth.service";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail, generateVerificationEmail } from "../mailer/mailer";

export const createUserController = async (req: Request, res: Response) => {
    try {
        const user = req.body;
        const password = user.password;
        const hashedPassword = bcrypt.hashSync(password, 10);
        user.password = hashedPassword;

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verification_code = verificationCode;
        user.is_verified = false;

        const createUser = await createUserService(user);

        if(!createUser) {
            return res.status(400).json({ message: "User creation failed" });
        }

        try {
            const { message, html } = generateVerificationEmail(verificationCode);
            await sendMail(
                user.email, // Changed from user.mail to user.email to match schema
                "Email Verification",
                message,
                html
            );
            
        } catch (emailerror) {
            console.error("Error sending verification email:", emailerror);
            return res.status(500).json({ message: "User created but verification email failed to send" });
        }
        
        return res.status(201).json({ 
            message: "User created successfully. Please check your email for verification code.", 
            user: createUser 
        });

    } catch (error) {
        console.error("Error in createUserController:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyUserController = async (req: Request, res: Response) => {
    const {email, code} = req.body;

    try {
        const user = await getUserByEmailService(email);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.verification_code) {
            return res.status(400).json({ message: "User is already verified" });
        }

        if (user.verification_code === code) {
            await verifyUserService(email);
            
            try {
                await sendMail(
                    email,
                    "Welcome! Email Verification Successful",
                    "Your email has been successfully verified. You can now login to your account.",
                    `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Welcome to Our Platform!</h2>
                        <p>Your email has been successfully verified.</p>
                        <p>You can now login to your account and start using our services.</p>
                        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
                            <p style="color: #007bff;">Thank you for joining us!</p>
                        </div>
                    </div>
                    `
                );
                return res.status(200).json({ message: "Email verified successfully" });
                
            } catch (error) {
                console.error("Error sending confirmation email:", error);
                return res.status(500).json({ message: "Email verified but confirmation email failed to send" });
            }
        } else {
            return res.status(400).json({ message: "Invalid verification code" });
        }

    } catch (error) {
        console.error("Error in verifyUserController:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

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

        if (!userExist.is_verified) {
            return res.status(403).json({ 
                message: "Please verify your email before logging in" 
            });
        }

        const payload = {
            sub: userExist.id,
            user_id: userExist.id,
            first_name: userExist.name,
            last_name: userExist.last_name,
            role: userExist.role,
            exp: Math.floor(Date.now() / 1000) + (60 * 60), // Token expires in 1 hour
        };

        const secret = process.env.JWT as string;
        if (!secret) {
            throw new Error("JWT secret is not defined");
        }
        const token = jwt.sign(payload, secret);
        return res.status(200).json({ 
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
};