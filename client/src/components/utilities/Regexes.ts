//Regex for the email
export const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//Regex for the username
export const usernameRegex: RegExp = /^[a-zA-Z0-9_-]{4,16}$/;

//Regex for the password
export const passwordRegex: RegExp =
	/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

//Regex for the first name
export const firstNameRegex: RegExp = /^[a-zA-Z]+([ -][a-zA-Z]+)*$/;

//Regex for the last name
export const lastNameRegex: RegExp = /^[a-zA-Z]+([ -][a-zA-Z]+)*$/;
