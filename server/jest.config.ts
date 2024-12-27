import { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.spec.ts'],
	moduleFileExtensions: ['ts', 'js'],
	transform: {
		'^.+\\.ts$': 'ts-jest',
	},
	roots: ['<rootDir>/tests'],
	verbose: true,
	setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
};

export default config;
