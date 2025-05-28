import express from 'express';
import dotenv from 'dotenv';
import { user } from './auth/auth.router';
import  todo  from './todo/todo.route';
dotenv.config();

const app = express();
const PORT = process.env.PORT 

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use(express.json());

user(app);
todo(app);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

