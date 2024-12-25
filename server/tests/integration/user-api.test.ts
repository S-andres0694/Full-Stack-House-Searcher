import request from 'supertest';
import { Application } from 'express';
import express from 'express';
import { testDbPath } from '../jest.setup';
import {
  dbTestOptions,
  initialValues,
  resetDatabase,
} from '../../database/init-db';
import connectionGenerator from '../../database/init-db';
import { Database } from 'better-sqlite3';
import morgan from 'morgan';
import userRoutesFactory from '../../routes/user_routes';
import {
  independentUser,
  user,
  user2,
  userSameEmailAsUser,
} from '../constants';
import { User } from '../../models/table-types';
import { Server } from 'http';
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import usersModelFactory from '../../models/users';
import { UsersModel } from '../../models/users';

let app: Application;
let dbConnection: Database;
let db: BetterSQLite3Database;
const port: number = 4000;
let server: Server;
let userModel: UsersModel;

beforeAll(() => {
  app = express();
  dbConnection = connectionGenerator(testDbPath, dbTestOptions);
  db = drizzle(dbConnection);
  userModel = usersModelFactory(db);

  //Logging middleware
  app.use(morgan('common'));
  //Extra middleware
  app.use(express.json());
  //Routes
  app.use('/users', userRoutesFactory(testDbPath));
  //Start the server
  server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

beforeEach(async () => {
  await resetDatabase(dbConnection, dbTestOptions);
  await initialValues(dbConnection);
});

describe('User API Testing', () => {
  it('tests that the endpoint works and that the server is running', async () => {
    const response = await request(app).get('/users/test');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Server is running');
  });

  it('tests that the create user endpoint works', async () => {
    //Checks the response behavior
    const response = await request(app).post('/users').send(user);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully');
    //Checks the database behavior
    const addedUser: User = (await userModel.getUserByUsername(user.username))!;
    expect(addedUser.username).toBe(user.username);
    expect(addedUser.email).toBe(user.email);
    expect(addedUser.name).toBe(user.name);
    expect(addedUser.role).toBe(user.role);
  });

  it('tests that the create user endpoint fails when the username already exists', async () => {
    await userModel.createUser(user);
    const response = await request(app).post('/users').send(user);
    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Username already exists');
  });

  it('tests that the create user endpoint fails when the email already exists', async () => {
    await userModel.createUser(user);
    const response = await request(app)
      .post('/users')
      .send(userSameEmailAsUser);
    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Email already exists');
  });

  it('tests that the create user endpoint fails when the user data is invalid', async () => {
    const response = await request(app).post('/users').send({});
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid user data');
  });

  it('tests that the getUserById endpoint works', async () => {
    await userModel.createUser(user);
    const userId: number = (await userModel.getUserId(user.username))!;
    const response = await request(app).get(`/users/${userId}`);
    expect(response.status).toBe(200);
    expect(response.body.username).toBe(user.username);
    expect(response.body.email).toBe(user.email);
    expect(response.body.name).toBe(user.name);
    expect(response.body.role).toBe(user.role);
  });

  it('tests that the getUserById endpoint fails when the user does not exist', async () => {
    const response = await request(app).get('/users/-1020');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('tests that the getUserByEmail endpoint works', async () => {
    await userModel.createUser(user);
    const response = await request(app).get(`/users/email/${user.email}`);
    expect(response.status).toBe(200);
    expect(response.body.username).toBe(user.username);
    expect(response.body.email).toBe(user.email);
    expect(response.body.name).toBe(user.name);
    expect(response.body.role).toBe(user.role);
  });

  it('tests that the getUserByEmail endpoint fails when the user does not exist', async () => {
    const response = await request(app).get(
      '/users/email/nonexistent@test.com',
    );
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('tests that the getAllUsers endpoint works', async () => {
    await userModel.createUser(user);
    await userModel.createUser(independentUser);
    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3); //Accounts for the admin user
    expect(response.body[1].username).toBe(user.username);
    expect(response.body[2].username).toBe(independentUser.username);
  });

  it('tests that the deleteUser endpoint works', async () => {
    await userModel.createUser(user);
    const userId: number = (await userModel.getUserId(user.username))!;
    const response = await request(app).delete(`/users/${userId}`);
    expect(response.status).toBe(204);
    const users: User[] = await userModel.getAllUsers();
    expect(users).toHaveLength(1); //Accounts for the admin user
  });

  it('tests that the deleteUser endpoint fails when the user does not exist', async () => {
    const response = await request(app).delete('/users/-1020');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('tests that the updateUserUsername endpoint works', async () => {
    await userModel.createUser(user);
    const userId: number = (await userModel.getUserId(user.username))!;
    const response = await request(app)
      .put(`/users/${userId}/username`)
      .send({ newUsername: 'newusername' });
    expect(response.status).toBe(204);
    expect((await userModel.getUserById(userId))?.username).toBe('newusername');
  });

  it('tests that the updateUserUsername endpoint fails when the new username already exists', async () => {
    await userModel.createUser(user);
    await userModel.createUser(independentUser);
    const userId: number = (await userModel.getUserId(
      independentUser.username,
    ))!;
    const response = await request(app)
      .put(`/users/${userId}/username`)
      .send({ newUsername: user.username });
    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Username already exists');
    expect((await userModel.getUserById(userId))?.username).toBe(
      independentUser.username,
    );
  });

  it('tests that the updateUserUsername endpoint fails when the new username is the same as the current username', async () => {
    await userModel.createUser(user);
    const userId: number = (await userModel.getUserId(user.username))!;
    const response = await request(app)
      .put(`/users/${userId}/username`)
      .send({ newUsername: user.username });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      'Cannot update username to the same username',
    );
  });

  it('tests that the updateUserUsername endpoint fails when the user does not exist', async () => {
    const response = await request(app)
      .put('/users/-1020/username')
      .send({ newUsername: 'newusername' });
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('tests that the updateUserEmail endpoint works', async () => {
    await userModel.createUser(user);
    const userId: number = (await userModel.getUserId(user.username))!;
    const response = await request(app)
      .put(`/users/${userId}/email`)
      .send({ newEmail: 'newemail@test.com' });
    expect(response.status).toBe(204);
    expect((await userModel.getUserById(userId))?.email).toBe(
      'newemail@test.com',
    );
  });

  it('tests that the updateUserEmail endpoint fails when the new email already exists', async () => {
    await userModel.createUser(user);
    await userModel.createUser(independentUser);
    const userId: number = (await userModel.getUserId(
      independentUser.username,
    ))!;
    const response = await request(app)
      .put(`/users/${userId}/email`)
      .send({ newEmail: user.email });
    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Email already exists');
    expect((await userModel.getUserById(userId))?.email).toBe(
      independentUser.email,
    );
  });

  it('tests that the updateUserEmail endpoint fails when the new email is the same as the current email', async () => {
    await userModel.createUser(user);
    const userId: number = (await userModel.getUserId(user.username))!;
    const response = await request(app)
      .put(`/users/${userId}/email`)
      .send({ newEmail: user.email });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Cannot update email to the same email');
  });

  it('tests that the updateUserEmail endpoint fails when the user does not exist', async () => {
    const response = await request(app)
      .put('/users/-1020/email')
      .send({ newEmail: 'newemail@test.com' });
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('tests that the updateUserEmail endpoint fails when the new email is not provided', async () => {
    await userModel.createUser(user);
    const userId: number = (await userModel.getUserId(user.username))!;
    const response = await request(app).put(`/users/${userId}/email`).send({});
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('New email is required');
  });

  it('tests that the hasRole endpoint works', async () => {
    await userModel.createUser(user);
    const userId: number = (await userModel.getUserId(user.username))!;
    const response = await request(app).get(
      `/users/${userId}/hasRole/${user.role}`,
    );
    expect(response.status).toBe(200);
    expect(response.body.hasRole).toBe(true);
  });

  it('tests that the hasRole endpoint fails when the user does not exist', async () => {
    const response = await request(app).get('/users/-1020/hasRole/user');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User does not exist');
  });

  it('tests that the hasRole endpoint fails when the role does not exist', async () => {
    await userModel.createUser(user);
    const userId: number = (await userModel.getUserId(user.username))!;
    const response = await request(app).get(
      `/users/${userId}/hasRole/nonexistentrole`,
    );
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Role does not exist');
  });

  it('tests that the getName endpoint works', async () => {
    await userModel.createUser(user);
    const userId: number = (await userModel.getUserId(user.username))!;
    const response = await request(app).get(`/users/${userId}/name`);
    expect(response.status).toBe(200);
    expect(response.body).toBe(user.name);
  });

  it('tests that the getName endpoint fails when the user does not exist', async () => {
    const response = await request(app).get('/users/-1020/name');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('tests that the getEmail endpoint works', async () => {
    await userModel.createUser(user);
    const userId: number = (await userModel.getUserId(user.username))!;
    const response = await request(app).get(`/users/${userId}/email`);
    expect(response.status).toBe(200);
    expect(response.body).toBe(user.email);
  });

  it('tests that the getEmail endpoint fails when the user does not exist', async () => {
    const response = await request(app).get('/users/-1020/email');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('tests that the getUserId endpoint works', async () => {
    await userModel.createUser(user);
    const response = await request(app).get(`/users/id/${user.username}`);
    expect(response.status).toBe(200);
    expect(response.body).toBe(await userModel.getUserId(user.username));
  });
});

afterAll(() => {
  server.close();
});
