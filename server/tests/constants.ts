import { NewProperty, NewUser } from '../types/table-types';

export const property: NewProperty = {
	url: 'https://www.example.com',
	address: '123 Main St, Anytown, USA',
	summary: 'This is an example property',
	monthlyRent: '1000',
	contactPhone: '1234567890',
	bedrooms: 3,
	identifier: 2783423,
};

export const property2: NewProperty = {
	url: 'https://www.example2.com',
	address: '456 Main St, Anytown, USA',
	summary: 'This is another example property',
	monthlyRent: '1500',
	contactPhone: '1234567890',
	bedrooms: 4,
	identifier: 2783424,
};

//Test user
export const user: NewUser = {
	username: 'testuser',
	password: 'testpassword',
	email: 'test@test.com',
	role: 'user',
	name: 'testuser',
};

//Test user with the same username as the first user
export const user2: NewUser = {
	username: 'testuser',
	password: 'testpassword2',
	email: 'test2@test.com',
	role: 'user',
	name: 'testuser2',
};

//Test user with the same email as the first user
export const userSameEmailAsUser: NewUser = {
	username: 'testuser3',
	password: 'testpassword3',
	email: 'test@test.com',
	role: 'user',
	name: 'testuser3',
};

export const independentUser: NewUser = {
	username: 'testuser4',
	password: 'testpassword4',
	email: 'test4@test.com',
	role: 'user',
	name: 'testuser4',
};
