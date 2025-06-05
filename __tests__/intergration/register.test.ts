import request from 'supertest';
import bcrypt from 'bcrypt';
import  app  from '../../src/index';
import db from '../../src/drizzle/db';


import { UsersTable } from '../../src/drizzle/schema';
import { eq } from 'drizzle-orm';


const testUser = {
    name: 'Test User',
    last_name: 'Last Name',
    email: 'ss',
    password: 'password123',
}

afterAll(async () => {
    await db.delete(UsersTable).where(eq(UsersTable.email, testUser.email));
    await db.$client.end();
    
})

describe("post/auth/register",()=>{
    it("should register a new user and return the user data",async () => {
        
        const hashedPassword = await bcrypt.hashSync(testUser.password, 10);
        const res = await request(app)
        .post('/auth/register')
        .send({
            name: testUser.name,
            last_name: testUser.last_name,
            email: testUser.email,
            password: hashedPassword,
        });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toEqual(
            expect.objectContaining({
                name: testUser.name,
                last_name: testUser.last_name,
                email: testUser.email,
            })
        );
        
    })
    it("should return 400 for missing fields", async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({
                name: testUser.name,
                last_name: testUser.last_name,
                email: testUser.email,
            });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toBe('Password is required');
        
    })
    it("should return 400 for existing email", async () => {
        const hashedPassword = await bcrypt.hashSync(testUser.password, 10);
        const res = await request(app)
            .post('/auth/register')
            .send({
                name: testUser.name,
                last_name: testUser.last_name,
                email: testUser.email,
                password: hashedPassword,
            });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toBe('Email already exists');
        
    })
})

