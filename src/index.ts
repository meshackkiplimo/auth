import express from 'express';
import dotenv from 'dotenv';
import { user } from './auth/auth.router';
import  todo  from './todo/todo.route';
dotenv.config();

const initializeApp =()=>{
 const app = express();
 app.use(express.json());

user(app);
todo(app);



app.get('/', (req, res) => {
    res.send('Hello, World!');
});
return app;



}
const app = initializeApp();
export default app;





