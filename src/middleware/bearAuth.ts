import jwt from 'jsonwebtoken';


import { Request, Response, NextFunction } from 'express';


export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {

const authHeader = req.headers.authorization;
if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return 
    
}
const token = authHeader.split(' ')[1];
try {
    const decode = jwt.verify(token, process.env.JWT as string);
    if (!decode || typeof decode !== 'object' || !('sub' in decode)) {
        res.status(401).json({ message: 'Unauthorized' });
        return 
    }

    
} catch (error) {
    console.error("Error in isAuthenticated middleware:", error);
    res.status(500).json({ message: 'Internal server error' });
    return 
    
}

}