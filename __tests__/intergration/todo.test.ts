import request from 'supertest';
import app from '../../src/index';
import db from '../../src/drizzle/db';
import { UsersTable } from '../../src/drizzle/schema';
import {TodoTable} from '../../src/drizzle/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';



let token: string;
let userId: number;
let todoId: number;

const testUser = {
    name: 'Test User',
    last_name: 'Last Name',
    email: 'hhd@gmail.com',
    password: 'password123',
}

beforeAll(async () => {
    const hashedPassword = await bcrypt.hashSync(testUser.password, 10);
    const user = await db.insert(UsersTable).values({
        name: testUser.name,
        last_name: testUser.last_name,
        email: testUser.email,
        password: hashedPassword,
    }).returning()
    userId = user[0].id;

    const res = await request(app)
        .post('/auth/login')
        .send({
            email: testUser.email,
            password: testUser.password,
        });
    token = res.body.token;
})
afterAll(async () => {
    // Clean up test user and todo
    await db.delete(UsersTable).where(eq(UsersTable.email, testUser.email));
    await db.delete(TodoTable).where(eq(TodoTable.userId, userId));
    await db.$client.end();


})

describe("Todo api intergration testes",()=>{
    it("should create a todo",async () => {
        const todo  ={
            todoName: "Test Todo",
            userId: userId,
            isCompleted: false,
            dueDate: new Date(),
            description: "Test description"
        }
        const res = await request(app)
            .post('/todo')
            .set('Authorization', `Bearer ${token}`)
            .send(todo);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("message", "Todo created successfully");
        todoId = res.body.id;
        console.log("Todo ID:", todoId);

        

        
    })
    it("should get all todos for a user", async () => {
        const res = await request(app)
            .get('/todo')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty("id");
        expect(res.body[0]).toHaveProperty("todoName");
        expect(res.body[0]).toHaveProperty("userId", userId);
    })
    it ("should get to do by id", async () => {
        const res = await request(app)
            .get(`/todo/${todoId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("id", todoId);
        expect(res.body).toHaveProperty("todoName");
        expect(res.body).toHaveProperty("userId", userId);
    }
    
)
    it("should update a todo", async () => {
        const updatedTodo = {
            todoName: "Updated Todo",
            isCompleted: true,
            dueDate: new Date(),
            description: "Updated description"
        }
        const res = await request(app)
            .put(`/todo/${todoId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedTodo);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message", "Todo updated successfully");
        expect(res.body).toHaveProperty("id", todoId);
    })
    it("should delete a todo", async () => {
        const res = await request(app)
            .delete(`/todo/${todoId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message", "Todo deleted successfully");
    })
    test("it should not geta a todo witha  ainvalid id", async () => {
        const res = await request(app)
            .get('/todo/999999')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: "Todo not found" });
    })
})