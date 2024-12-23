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
      await rolesModel.createRole("testrole", "testdescription");
      const role = await rolesModel.checkRoleExists("testrole");
      expect(role).toBe(true);
  });
    
    it("should be able to delete a role", async () => {
        await rolesModel.createRole("testrole", "testdescription");
        const roleId: number = (await rolesModel.getRoleId("testrole"))!;
        await rolesModel.deleteRole(roleId);
        const deletedRole = await rolesModel.checkRoleExists("testrole");
        expect(deletedRole).toBe(false);
    });

    it("should be able to get all roles", async () => {
        await rolesModel.createRole("testrole", "testdescription");
        await rolesModel.createRole("testrole2", "testdescription2");
        const roles = await rolesModel.getAllRoles();
        expect(roles).toHaveLength(4); //Accounts for the admin and user roles
    });

    it("should be able to check if a role exists", async () => {
        await rolesModel.createRole("testrole", "testdescription");
        const role = await rolesModel.checkRoleExists("testrole");
        expect(role).toBe(true);
    });

    it("should be able to get the ID of a role", async () => {
        await rolesModel.createRole("testrole", "testdescription");
        const roleId: number = (await rolesModel.getRoleId("testrole"))!;
        expect(roleId).toBeDefined();
    });

    it("should be able to get the name of a role", async () => {
        await rolesModel.createRole("testrole", "testdescription");
        const roleId: number = (await rolesModel.getRoleId("testrole"))!;
        const roleName: string = (await rolesModel.getRoleName(roleId))!;
        expect(roleName).toBe("testrole");
    });
});



