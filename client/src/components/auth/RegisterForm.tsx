import { useSpring } from '@react-spring/web';
import { FunctionComponent } from 'react';
import { SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { NavigateFunction } from 'react-router-dom';
import { RegisterRequest } from '../../types/authentication-types';
import {
	checkEmailExists,
	checkUsernameExists,
	register as registerUser,
} from '../../services/authentication-services';
import { Stack } from '@chakra-ui/react';
import { Field } from '../ui/field';
import { InputField } from '../utilities/TextInputField';
import { PasswordField } from '../utilities/PasswordField';
import { ButtonWithHoverAnimations } from '../utilities/ButtonWithHoverAnimations';
import { PasswordInput } from '../ui/password-input';
export const RegisterForm: FunctionComponent = () => {
	//Hook for the navigation to other pages
	const navigate: NavigateFunction = useNavigate();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
		clearErrors,
		getValues,
	}: UseFormReturn<RegisterRequest> = useForm<RegisterRequest>();

	//Handler for the form submission
	const onSubmit: SubmitHandler<RegisterRequest> = async (
		data: RegisterRequest,
	) => {
		try {
			data.confirmPassword = undefined as any;
			await registerUser(data);
			navigate('/login');
		} catch (error: any) {
			setError('root.serverError', { message: error.message });
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack gap="4" align="center">
				<InputField
					label="First Name"
					name="name"
					type="text"
					placeholder="Enter your first name"
					regexPattern={/^[a-zA-Z]+([ -][a-zA-Z]+)*$/}
					register={register}
					errors={errors}
					setError={setError}
					required={true}
					requiredLabel={true}
				/>
				<InputField
					label="Last Name"
					name="lastname"
					type="text"
					placeholder="Enter your last name"
					regexPattern={/^[a-zA-Z]+$/}
					register={register}
					errors={errors}
					setError={setError}
					required={true}
					requiredLabel={true}
				/>
				<InputField
					label="Email"
					name="email"
					type="email"
					placeholder="Enter your email"
					regexPattern={/^[^\s@]+@[^\s@]+\.[^\s@]+$/}
					register={register}
					errors={errors}
					setError={setError}
					required={true}
					requiredLabel={true}
					onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
						if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(event.target.value)) {
							clearErrors('email');
							const email: string = event.target.value;
							const emailExists: boolean = await checkEmailExists(email);
							if (emailExists) {
								setError('email', {
									message: 'Email already exists',
								});
							}
						} else if (event.target.value === '') {
							clearErrors('email');
						} else {
							setError('email', {
								message: 'Invalid email',
							});
						}
					}}
				/>
				<InputField
					label="Username"
					name="username"
					type="text"
					placeholder="Enter your username"
					regexPattern={/^[a-zA-Z0-9]+$/}
					register={register}
					errors={errors}
					setError={setError}
					required={true}
					requiredLabel={true}
					onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
						if (/^[a-zA-Z0-9]+$/.test(event.target.value)) {
							clearErrors('username');
							const username: string = event.target.value;
							const usernameExists: boolean = await checkUsernameExists(
								username,
							);
							if (usernameExists) {
								setError('username', {
									message: 'Username already exists',
								});
							}
						} else if (event.target.value === '') {
							clearErrors('username');
						} else {
							setError('username', {
								message: 'Invalid username',
							});
						}
					}}
				/>
				<PasswordField
					errors={errors}
					register={register}
					required={true}
					requiredLabel={true}
					onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
						if (
							/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(
								event.target.value,
							)
						) {
							clearErrors('password');
						} else if (event.target.value === '') {
							clearErrors('password');
						} else {
							setError('password', {
								message:
									'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character',
							});
						}
					}}
				/>
				<Field
					label="Confirm Password"
					invalid={!!errors.confirmPassword}
					errorText={errors.confirmPassword?.message?.toString()}
					colorPalette="accent"
					required={true}
				>
					<PasswordInput
						placeholder="Confirm your password"
						variant="subtle"
						{...register('confirmPassword', {
							required: 'Password is required',
						})}
						onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
							if (event.target.value === getValues('password')) {
								clearErrors('confirmPassword');
							} else if (event.target.value === '') {
								clearErrors('confirmPassword');
							} else {
								setError('confirmPassword', {
									message: 'Passwords do not match',
								});
							}
						}}
						className={`px-4 ${
							!errors.confirmPassword
								? 'focus:border border-black dark:border-white'
								: 'border border-red-500'
						} rounded-full`}
					/>
				</Field>
				<ButtonWithHoverAnimations
					type="submit"
					text="Register"
					onClick={() => {}}
				/>
			</Stack>
		</form>
	);
};
