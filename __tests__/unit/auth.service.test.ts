import db from "../../src/drizzle/db"
import  {createUserService} from "../../src/auth/auth.service"


jest.mock("../../src/drizzle/db", ()=>({
    insert:jest.fn()

}))
beforeEach(()=>{
    jest.clearAllMocks();
})
describe("Auth Service",()=>{


    describe("createUserService",()=>{
        it("should insert a user and return the inserted user",async () => {
            const user= {
                name: "Test User",
                last_name: "Last Name",
                email: "ee@gmail.com"
            }
            const inserted = {id:1, ...user};
            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([inserted])
                })
            });
            
        })
        it("should return null if insertion fails", async () => {

            const user = {
                name: "Test User",
                last_name: "Last Name",
                email: "nnn@gmail.com",
                password: "password123",
                

            };
            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([null])
                })
            });
            const result = await createUserService(user);
            expect(result).toBeNull();
            expect(db.insert).toHaveBeenCalledWith(expect.anything());
            
        })

        })

    })

