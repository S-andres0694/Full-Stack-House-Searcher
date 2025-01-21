import { FunctionComponent } from 'react';
import { SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { NavigateFunction } from 'react-router-dom';
import { RegisterRequest } from '../../types/authentication-types';
import {
	checkEmailExists,
	checkInvitationToken,
	checkUsernameExists,
	register as registerUser,
} from '../../services/authentication-services';
import { Stack } from '@chakra-ui/react';
import { Field } from '../ui/field';
import { InputField } from '../utilities/Text-Input-Field';
import { PasswordField } from '../utilities/PasswordField';
import { ButtonWithHoverAnimations } from '../utilities/ButtonWithHoverAnimations';
import { PasswordInput } from '../ui/password-input';
import { notify } from '../utilities/popup-notification';
import {
	emailRegex,
	usernameRegex,
	passwordRegex,
	firstNameRegex,
	lastNameRegex,
} from '../utilities/Regexes';
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
			data.name = `${data.firstname} ${data.lastname}`;
			data.firstname = undefined as any;
			data.lastname = undefined as any;
			await registerUser(data);
			navigate('/login');
		} catch (error: any) {
			if (error.response?.status === 500) {
				notify(
					'Unable to register',
					'An unknown error occurred in the server. Please try again.',
					'error',
				);
				return;
			}

			notify(
				'Unable to register',
				'An unknown error occurred. Please try again.',
				'error',
			);
			return;
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack gap="4" align="center">
				<InputField
					label="First Name"
					name="firstname"
					type="text"
					placeholder="Enter your first name"
					regexPattern={firstNameRegex}
					register={register}
					errors={errors}
					setError={setError}
					required={true}
					requiredLabel={true}
					onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
						const firstName: string = event.target.value;
						if (firstName === '' || firstNameRegex.test(firstName)) {
							clearErrors('firstname');
							return;
						}

						setError('firstname', {
							message:
								'Invalid first name. Only letters and spaces are allowed.',
						});
					}}
				/>
				<InputField
					label="Last Name"
					name="lastname"
					type="text"
					placeholder="Enter your last name"
					regexPattern={lastNameRegex}
					register={register}
					errors={errors}
					setError={setError}
					required={true}
					requiredLabel={true}
					onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
						const lastName: string = event.target.value;
						if (lastNameRegex.test(lastName)) {
							clearErrors('lastname');
							return;
						}
						if (lastName === '') {
							clearErrors('lastname');
							return;
						}

						setError('lastname', {
							message:
								'Invalid last name. Only letters and spaces are allowed.',
						});
					}}
				/>
				<InputField
					label="Email"
					name="email"
					type="email"
					placeholder="Enter your email"
					regexPattern={emailRegex}
					register={register}
					errors={errors}
					setError={setError}
					required={true}
					requiredLabel={true}
					onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
						if (emailRegex.test(event.target.value)) {
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
					regexPattern={usernameRegex}
					register={register}
					errors={errors}
					setError={setError}
					required={true}
					requiredLabel={true}
					onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
						if (usernameRegex.test(event.target.value)) {
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
				<InputField
					label="Invitation Token"
					name="invitationToken"
					type="text"
					placeholder="Enter your invitation token"
					regexPattern={/^[\s\S]*$/}
					register={register}
					errors={errors}
					setError={setError}
					required={true}
					requiredLabel={true}
					onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
						const token: string = event.target.value;
						if (token === '') {
							clearErrors('invitationToken');
							return;
						}

						//Check if the invitation token is valid
						const status: string = await checkInvitationToken(token);

						//Check if the invitation token is used
						if (status === 'used') {
							setError('invitationToken', {
								message: 'Invitation token already used',
							});
							return;
						}

						//Check if the invitation token does not exist
						if (status === 'not found') {
							setError('invitationToken', {
								message: 'Invitation token does not exist',
							});
							return;
						}

						//Check if the invitation token is valid
						if (status === 'valid') {
							clearErrors('invitationToken');
							return;
						}
					}}
				/>
				<PasswordField
					errors={errors}
					register={register}
					required={true}
					requiredLabel={true}
					onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
						if (passwordRegex.test(event.target.value)) {
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
						className={`px-4 ${!errors.confirmPassword
							? 'focus:border border-black dark:border-white'
							: 'border border-red-500'
							} rounded-full`}
					/>
				</Field>
				<ButtonWithHoverAnimations
					type="submit"
					text="Register"
					onClick={() => { }}
					disabled={Object.keys(errors).length > 0}
				/>
			</Stack>
		</form>
	);
};
