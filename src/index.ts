import express from 'express';
import dotenv from 'dotenv';
import { user } from './auth/auth.router';
import  todo  from './todo/todo.route';
import cors from 'cors';
dotenv.config();

const initializeApp =()=>{
 const app = express();
 app.use(express.json());

user(app);
todo(app);
//cors to link with frontend

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // credentials: true,
}));




app.get('/', (req, res) => {
    res.send('Hello, World!');
});
return app;



}
const app = initializeApp();
export default app;





