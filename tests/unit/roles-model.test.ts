import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import rolesModelFactory, { RolesModel } from "../../src/models/roles";
import connectionGenerator, {
  dbTestOptions,
  initialValues,
  resetDatabase,
} from "../../src/database/init-db";
import { Database } from "better-sqlite3";
import { testDbPath } from "../jest.setup";

let rolesModel: RolesModel;
let drizzleORM: BetterSQLite3Database;
let db: Database;

beforeAll(() => {
  db = connectionGenerator(testDbPath, dbTestOptions);
  drizzleORM = drizzle(db);
  rolesModel = rolesModelFactory(drizzleORM);
});

beforeEach(async () => {
  db = connectionGenerator(testDbPath, dbTestOptions);
  await resetDatabase(db, dbTestOptions);
  await initialValues(db);
});

afterAll(() => {
  if (db) {
    db.close();
  }
});

describe("Roles Model Unit Tests", () => {
  it("should be able to create a role", async () => {
    const role = await rolesModel.createRole("testrole", "testdescription");
    expect(role).toBeDefined();
  });
    
    it("should be able to delete a role", async () => {
        const role = await rolesModel.createRole("testrole", "testdescription");
        const deletedRole = await rolesModel.deleteRole(role.id);
        expect(deletedRole).toBeDefined();
    });
});



