import rolesModelFactory, { RolesModel } from '../../models/roles';
import connectionGenerator, {
	initialValues,
	resetDatabase,
	testDatabaseConfiguration,
} from '../../database/init-db.v2';
import * as schema from '../../database/schema';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';

let rolesModel: RolesModel;
let db: NodePgDatabase<typeof schema>;

beforeAll(() => {
	db = connectionGenerator(testDatabaseConfiguration);
	rolesModel = rolesModelFactory(db);
});

beforeEach(async () => {
	db = connectionGenerator(testDatabaseConfiguration);
	await resetDatabase(db);
	await initialValues(db);
});

describe('Roles Model Unit Tests', () => {
	it('should be able to create a role', async () => {
		await rolesModel.createRole('testrole', 'testdescription');
		const role = await rolesModel.checkRoleExists('testrole');
		expect(role).toBe(true);
	});

	it('should be able to delete a role', async () => {
		await rolesModel.createRole('testrole', 'testdescription');
		const roleId: number = (await rolesModel.getRoleId('testrole'))!;
		await rolesModel.deleteRole(roleId);
		const deletedRole = await rolesModel.checkRoleExists('testrole');
		expect(deletedRole).toBe(false);
	});

	it('should be able to get all roles', async () => {
		await rolesModel.createRole('testrole', 'testdescription');
		await rolesModel.createRole('testrole2', 'testdescription2');
		const roles = await rolesModel.getAllRoles();
		expect(roles).toHaveLength(4); //Accounts for the admin and user roles
	});

	it('should be able to check if a role exists', async () => {
		await rolesModel.createRole('testrole', 'testdescription');
		const role = await rolesModel.checkRoleExists('testrole');
		expect(role).toBe(true);
	});

	it('should be able to get the ID of a role', async () => {
		await rolesModel.createRole('testrole', 'testdescription');
		const roleId: number = (await rolesModel.getRoleId('testrole'))!;
		expect(roleId).toBeDefined();
	});

	it('should be able to get the name of a role', async () => {
		await rolesModel.createRole('testrole', 'testdescription');
		const roleId: number = (await rolesModel.getRoleId('testrole'))!;
		const roleName: string = (await rolesModel.getRoleName(roleId))!;
		expect(roleName).toBe('testrole');
	});
});
