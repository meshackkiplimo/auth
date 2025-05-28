import jwt from 'jsonwebtoken';


import { Request, Response, NextFunction } from 'express';



// export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {

// const authHeader = req.headers.authorization;
// if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     res.status(401).json({ message: 'Unauthorized' });
//     return 
    
// }
// const token = authHeader.split(' ')[1];
// try {
//     const decode = jwt.verify(token, process.env.JWT as string);
//     if (!decode || typeof decode !== 'object' || !('sub' in decode)) {
//         res.status(401).json({ message: 'Unauthorized' });
//         return 
//     }

    
// } catch (error) {
//     console.error("Error in isAuthenticated middleware:", error);
//     res.status(500).json({ message: 'Internal server error' });
//     return 
    
// }

// }

export const checkRoles = (requiredRole:"admin" | "user" | "both") => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decode = jwt.verify(token, process.env.JWT as string) as { role: "admin" | "user" };
        (req as any).user = decode; // Attach user info to request object
        if (
            typeof decode === 'object' &&
            decode !== null &&
            "role" in decode
        ) {
            if(requiredRole === "both")
                if(decode.role === "admin" || decode.role === "user"){
                    next();
                    return
                }
        else if (
            decode.role === requiredRole 
        ){
            next();
            return;
        }
        res.status(403).json({ message: 'anauthorized' });
        return;

    }else{
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

}

    catch (error) {
        console.error("Error in checkRoles middleware:", error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
}
}
export const adminRoleAuth=checkRoles("admin");
export const userRoleAuth=checkRoles("user");
export const bothRoleAuth=checkRoles("both");