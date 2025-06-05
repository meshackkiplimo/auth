
import request from 'supertest';
import bcrypt from 'bcrypt';
import  app  from '../../src/index';
import db from '../../src/drizzle/db';


import { UsersTable } from '../../src/drizzle/schema';
import { eq } from 'drizzle-orm';



let testUser = {
    name: 'Test User',
    last_name: 'Last Name',
    email: 'ff@gmail.com',
    password: 'password123',
}

beforeAll(async () => {
    const hashedPassword = await bcrypt.hashSync(testUser.password, 10);
    await db.insert(UsersTable).values({
        name: testUser.name,
        last_name: testUser.last_name,
        email: testUser.email,
        password: hashedPassword,
    });
    
})
afterAll(async () => {
    await db.delete(UsersTable).where(eq(UsersTable.email,testUser.email));
    await db.$client.end();
});

describe("post /auth/login",()=>{
    it("should authennticate a user and return a token",async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        expect(res.body.user).toEqual(
            expect.objectContaining({
                name: testUser.name,
                last_name: testUser.last_name,
                email: testUser.email,
            })
        )
        
    })
    it("should return 401 for invalid credentials", async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword',
            });
        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: 'Invalid email or password' });
    });

    it("should return 404 for non-existing user", async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: 'sss@gg',
                password: 'password123',
            });
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'User not found' });
    });
   
    

})