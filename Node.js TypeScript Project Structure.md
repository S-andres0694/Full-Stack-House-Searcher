# Comprehensive Node.js/TypeScript Project Structure Guide

## Table of Contents
1. Controllers Directory
2. Database Directory
3. Middlewares Directory
4. Models Directory
5. Routes Directory
6. Views Directory
7. Configuration Files
8. Types and Interfaces

## 1. Controllers Directory (`/src/controllers`)

Controllers handle the business logic of your application. They receive requests from routes and interact with models and services.

### Structure Pattern
```typescript
// UserController.ts
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { CreateUserDTO, UpdateUserDTO } from '../types/user.types';
import { ValidationError } from '../utils/errors';

export class UserController {
    // Constructor for dependency injection
    constructor(private userService: UserService) {}

    // GET /users
    public async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const users = await this.userService.findAll({ page, limit });
            
            return res.status(200).json({
                success: true,
                data: users,
                pagination: {
                    page,
                    limit,
                    total: users.length
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /users
    public async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userData: CreateUserDTO = req.body;
            
            // Validation logic
            if (!userData.email || !userData.password) {
                throw new ValidationError('Email and password are required');
            }

            const user = await this.userService.create(userData);
            return res.status(201).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT /users/:id
    public async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;
            const updateData: UpdateUserDTO = req.body;
            
            const updatedUser = await this.userService.update(userId, updateData);
            return res.status(200).json({
                success: true,
                data: updatedUser
            });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /users/:id
    public async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;
            await this.userService.delete(userId);
            
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
```

### Best Practices for Controllers
1. Keep controllers focused on:
   - Request/Response handling
   - Input validation
   - Calling appropriate services
   - Error handling
   - Response formatting

2. Avoid putting business logic directly in controllers
3. Use dependency injection for services
4. Implement consistent error handling
5. Use TypeScript decorators for common patterns
6. Include comprehensive request validation

## 2. Database Directory (`/src/database`)

The database directory contains all database-related code, including migrations, seeders, and configuration.

### Database Configuration
```typescript
// database/config.ts
import { ConnectionOptions } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const dbConfig: ConnectionOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
        __dirname + '/../models/*.ts'
    ],
    synchronize: false,
    migrations: [
        __dirname + '/migrations/*.ts'
    ],
    cli: {
        migrationsDir: 'src/database/migrations'
    }
};
```

### Migrations
```typescript
// database/migrations/1234567890-CreateUsersTable.ts
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1234567890 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()'
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        isUnique: true
                    },
                    {
                        name: 'password',
                        type: 'varchar'
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()'
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'now()'
                    }
                ]
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users');
    }
}
```

### Seeders
```typescript
// database/seeders/UserSeeder.ts
import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { User } from '../../models/User';

export default class CreateUsers implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<void> {
        await factory(User)().createMany(10);
    }
}
```

## 3. Middlewares Directory (`/src/middlewares`)

Middlewares handle cross-cutting concerns like authentication, logging, and error handling.

### Authentication Middleware
```typescript
// middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors';

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            throw new UnauthorizedError('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded;
        
        next();
    } catch (error) {
        next(new UnauthorizedError('Invalid token'));
    }
};
```

### Error Handling Middleware
```typescript
// middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/errors';

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error instanceof CustomError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            errors: error.errors
        });
    }

    // Log unexpected errors
    console.error(error);

    return res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
};
```

### Request Logging Middleware
```typescript
// middlewares/logging.middleware.ts
import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            userAgent: req.get('user-agent')
        });
    });

    next();
};
```

## 4. Models Directory (`/src/models`)

Models define your data structures and database schemas.

### User Model Example
```typescript
// models/User.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert
} from 'typeorm';
import { IsEmail, MinLength } from 'class-validator';
import bcrypt from 'bcrypt';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    @IsEmail()
    email: string;

    @Column()
    @MinLength(8)
    password: string;

    @Column({ nullable: true })
    firstName?: string;

    @Column({ nullable: true })
    lastName?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }

    async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
    }
}
```

## 5. Routes Directory (`/src/routes`)

Routes define your API endpoints and connect them to controllers.

### Route Configuration
```typescript
// routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';

const router = Router();
const userController = new UserController();

router
    .route('/')
    .get(authMiddleware, userController.getUsers)
    .post(validateRequest(createUserSchema), userController.createUser);

router
    .route('/:id')
    .get(authMiddleware, userController.getUser)
    .put(
        authMiddleware,
        validateRequest(updateUserSchema),
        userController.updateUser
    )
    .delete(authMiddleware, userController.deleteUser);

export default router;
```

### API Routes Configuration
```typescript
// routes/index.ts
import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import { requestLogger } from '../middlewares/logging.middleware';

const router = Router();

// Apply common middlewares
router.use(requestLogger);

// Mount routes
router.use('/users', userRoutes);
router.use('/auth', authRoutes);

export default router;
```

## 6. Views Directory (`/src/views`)

If your application uses server-side rendering, the views directory contains your templates.

### EJS Template Example
```typescript
// views/layouts/main.ejs
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title %></title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <%- include('../partials/header') %>
    
    <main>
        <%- body %>
    </main>
    
    <%- include('../partials/footer') %>
    
    <script src="/js/main.js"></script>
</body>
</html>
```

## 7. Configuration Files

### App Configuration
```typescript
// app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { configureDatabase } from './database/config';

export class App {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.configureMiddlewares();
        this.configureRoutes();
        this.configureErrorHandling();
    }

    private configureMiddlewares(): void {
        this.app.use(cors());
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private configureRoutes(): void {
        this.app.use('/api/v1', routes);
    }

    private configureErrorHandling(): void {
        this.app.use(errorHandler);
    }

    public async start(): Promise<void> {
        await configureDatabase();
        const port = process.env.PORT || 3000;
        
        this.app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
}
```

### TypeScript Configuration
```json
// tsconfig.json
{
    "compilerOptions": {
        "target": "es2017",
        "module": "commonjs",
        "lib": ["es6", "es2017", "esnext.asynciterable"],
        "skipLibCheck": true,
        "sourceMap": true,
        "outDir": "./dist",
        "moduleResolution": "node",
        "removeComments": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "strictFunctionTypes": true,
        "noImplicitThis": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true,
        "allowSyntheticDefaultImports": true,
        "esModuleInterop": true,
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "baseUrl": "."
    },
    "exclude": ["node_modules"],
    "include": ["./src/**/*.ts"]
}
```

## Types and Interfaces (`/src/types`)

### Type Definitions
```typescript
// types/user.types.ts
export interface CreateUserDTO {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface UpdateUserDTO {
    email?: string;
    firstName?: string;
    lastName?: string;
}

export interface UserResponse {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    createdAt: Date;
    updatedAt: Date;
}
```

## Best Practices Summary

### Code Organization
1. Follow the Single Responsibility Principle
2. Use TypeScript decorators and types consistently
3. Implement proper error handling at all levels
4. Use dependency injection for better testing
5. Keep controllers thin, services thick
6. Use DTOs for data validation
7. Implement proper logging
8. Use environment variables for configuration
9. Write comprehensive tests
10. Document your code thoroughly

### Security
1. Always validate user input
2. Use proper authentication and authorization
3. Implement rate limiting
4. Use HTTPS
5. Sanitize database queries
6. Keep dependencies updated
7. Implement