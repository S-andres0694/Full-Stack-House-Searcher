import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { NewUser } from "../../src/models/table-types";
import { UsersModel } from "../../src/models/users";
import connectionGenerator, {
  dbTestOptions,
  initialValues,
  resetDatabase,
} from "../../src/database/init-db";
import { Database } from "better-sqlite3";
import { compare } from "bcrypt";
import { testDbPath } from "../jest.setup";
let usersModel: UsersModel;
let drizzleORM: BetterSQLite3Database;
let db: Database;

//Test user
const user: NewUser = {
  username: "testuser",
  password: "testpassword",
  email: "test@test.com",
  role: "user",
  name: "testuser",
};

//Test user with the same username as the first user
const user2: NewUser = {
  username: "testuser",
  password: "testpassword2",
  email: "test2@test.com",
  role: "user",
  name: "testuser2",
};

let userId: number;

beforeAll(() => {
  db = connectionGenerator(testDbPath, dbTestOptions);
  drizzleORM = drizzle(db);
  usersModel = new UsersModel(drizzleORM);
});

beforeEach(async () => {
  await resetDatabase(db, dbTestOptions);
  await initialValues(db);
  userId = await usersModel.createUser(user);
});

afterAll(() => {
  if (db) {
    db.close();
  }
});

describe("Users Model Unit Tests", () => {
  //Test 1:
  it("should be able to create a user", async () => {
    expect(userId).toBeDefined();
  });

  //Test 2:
  it("should be able to get a user by id", async () => {
    const retrievedUser = await usersModel.getUserById(userId);
    expect(retrievedUser).toBeDefined();
    expect(retrievedUser?.username).toBe(user.username);
    expect(retrievedUser?.email).toBe(user.email);
    expect(retrievedUser?.role).toBe(user.role);
    expect(retrievedUser?.name).toBe(user.name);
    expect(retrievedUser?.password).toBe(user.password);
    expect(retrievedUser?.id).toBe(userId);
  });

  //Test 3:
  it("should be able to get a user by username", async () => {
    const retrievedUser = await usersModel.getUserByUsername(user.username);
    expect(retrievedUser).toBeDefined();
    expect(retrievedUser?.username).toBe(user.username);
  });

  //Test 4:
  it("should be able to get a user by email", async () => {
    const retrievedUser = await usersModel.getUserByEmail(user.email);
    expect(retrievedUser).toBeDefined();
    expect(retrievedUser?.email).toBe(user.email);
  });

  //Test 5:
  it("should be able to get all users", async () => {
    const retrievedUsers = await usersModel.getAllUsers();
    expect(retrievedUsers).toBeDefined();
    expect(retrievedUsers?.length).toBeGreaterThan(0);
  });

  //Test 6:
  it("should be able to delete a user", async () => {
    await usersModel.deleteUser(user.username);
    const retrievedUser = await usersModel.getUserById(userId);
    expect(retrievedUser).toBeUndefined();
  });

  //Test 7:
  it("should be able to update a user's username", async () => {
    await usersModel.updateUserUsername(userId, "updatedusername");
    const retrievedUser = await usersModel.getUserById(userId);
    expect(retrievedUser).toBeDefined();
    expect(retrievedUser?.username).toBe("updatedusername");
  });

  //Test 8:
  it("should be able to update a user's email", async () => {
    await usersModel.updateUserEmail(user.username, "updatedemail@test.com");
    const retrievedUser = await usersModel.getUserById(userId);
    expect(retrievedUser).toBeDefined();
    expect(retrievedUser?.email).toBe("updatedemail@test.com");
  });

  //Test 9:
  it("should be able to update a user's password", async () => {
    await usersModel.updateUserPassword(user.username, "updatedpassword");
    const retrievedUser = await usersModel.getUserById(userId);
    expect(retrievedUser).toBeDefined();
    expect(
      await compare("updatedpassword", retrievedUser?.password || "")
    ).toBe(true);
  });

  //Test 10:
  it("should be able to check that a user exists", async () => {
    const userExists = await usersModel.usernameExists(user.username);
    expect(userExists).toBe(true);
  });

  //Test 11:
  it("should be able to check that a user does not exist", async () => {
    const userExists = await usersModel.usernameExists("nonexistentuser");
    expect(userExists).toBe(false);
  });

  //Test 12:
  it("should be able to check that an email exists", async () => {
    const emailExists = await usersModel.emailExists(user.email);
    expect(emailExists).toBe(true);
  });

  //Test 13:
  it("should be able to check that a user has a specific role", async () => {
    const userHasRole = await usersModel.hasRole(user.username, user.role);
    expect(userHasRole).toBe(true);
  });

  //Test 14:
  it("should be able to check that a user does not have a specific role", async () => {
    const userHasRole = await usersModel.hasRole(user.username, "admin");
    expect(userHasRole).toBe(false);
  });

  //Test 15:
  it("should be able to check that an email does not exist", async () => {
    const emailExists = await usersModel.emailExists(
      "nonexistentemail@test.com"
    );
    expect(emailExists).toBe(false);
  });

  //Test 16
  it("it tests that the getUserById method works when passed an invalid id", async () => {
    const retrievedUser = await usersModel.getUserById(NaN);
    expect(retrievedUser).toBeUndefined();
  });

  //Test 17
  it("tests that the getName method works", async () => {
    const retrievedUser = await usersModel.getName(user.username);
    expect(retrievedUser).toBe(user.name);
  });

  //Test 18
  it("tests that the getEmail method works", async () => {
    const retrievedUser = await usersModel.getEmail(user.username);
    expect(retrievedUser).toBe(user.email);
  });

  //Test 19
  it("tests that an error happens when trying to add a user with the same username", async () => {
    //Check if there is a user with the same username
    const userExists = await usersModel.usernameExists(user2.username);
    expect(userExists).toBe(true);
    //Try to create a user with the same username
    await expect(usersModel.createUser(user2)).rejects.toThrow();
  });

  //Test 20
  it("tests that an error happens when trying to add a user with the same email", async () => {
    //Check if there is a user with the same email
    const emailExists = await usersModel.emailExists(user.email);
    expect(emailExists).toBe(true);
    //Try to create a user with the same email
    await expect(usersModel.createUser(user)).rejects.toThrow();
  });

  //Test 21
  it("tests that it returns the correct error message when trying to add a user with the same username", async () => {
    //Try to create a user with the same username
    const validationResult = await usersModel.validateUniqueUsernameAndEmail(user);
    expect(validationResult).toBe("Username already exists");
  });

  //Test 22
  it("tests that it returns the correct error message when trying to add a user with the same email", async () => {
    //Try to create a user with the same email
    const userWithSameEmail: NewUser = { 
    username: "testuser3",
    password: "testpassword3",
    email: user.email, // Same email as original user
    role: "user",
    name: "testuser3"
    };
    const validationResult = await usersModel.validateUniqueUsernameAndEmail(userWithSameEmail);
    expect(validationResult).toBe("Email already exists");
  });

  //Test 23
  it("tests that it returns true when trying to add a user with unique username and email", async () => {
    //Try to create a user with the same email
    const userWithUniqueEmail: NewUser = {
      username: "testuser3",
      password: "testpassword3",
      email: "test3@test.com", // Unique email
      role: "user",
      name: "testuser3",
    };
    //Try to create a user with unique username and email
    const validationResult = await usersModel.validateUniqueUsernameAndEmail(
      userWithUniqueEmail
    );
    expect(validationResult).toBe(true);
  });
});
