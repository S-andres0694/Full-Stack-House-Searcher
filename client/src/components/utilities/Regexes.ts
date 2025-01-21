//Regex for the email
export const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//Regex for the username
export const usernameRegex: RegExp = /^[a-zA-Z0-9_-]{4,16}$/;

//Regex for the password
export const passwordRegex: RegExp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
