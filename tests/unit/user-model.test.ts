import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { NewUser } from "../../src/models/table-types";
import { UsersModel } from "../../src/models/users";
import connectionGenerator, { databaseCreator } from "../../src/database/init-db";
import { Database } from "better-sqlite3";
import { unlinkSync } from "fs";
import { existsSync } from "fs";

let usersModel: UsersModel;
let drizzleORM: BetterSQLite3Database;
let db: Database;

//Test database Path
const testDbPath: string = __dirname + "/test-database.sqlite";

beforeAll(() => {
  databaseCreator(testDbPath);
  db = connectionGenerator(testDbPath);
  drizzleORM = drizzle({ client: db });
  usersModel = new UsersModel(drizzleORM);
});

describe("Users Model Unit Tests", () => {
  it("should be able to create a user", async () => {
    const user: NewUser = { username: "testuser", password: "testpassword", email: "test@test.com", role: "user", name: "testuser" };
    const userId = await usersModel.createUser(user);
    expect(userId).toBeDefined();
  });
}); 

afterAll(() => {
  if (existsSync(testDbPath)) {
    unlinkSync(testDbPath);
  }
});