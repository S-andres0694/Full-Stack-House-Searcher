import { Stack } from '@chakra-ui/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { LoginWithJWTRequest } from '../../types/authentication-types';
import {
	loginThroughJWT,
	checkEmailExists,
} from '../../services/authentication-services';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { InputField } from '../utilities/Text-Input-Field';
import { PasswordField } from '../utilities/PasswordField';
import { ButtonWithHoverAnimations } from '../utilities/ButtonWithHoverAnimations';
import { notify } from '../utilities/popup-notification';
import { emailRegex } from '../utilities/Regexes';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { authenticationSlice } from '../../store/slices/authenticationSlice';
/**
 * A form for logging in a user through JWT.
 * @returns A form for logging in a user through JWT.
 */

export const LoginForm: React.FunctionComponent<{}> = () => {
	//Hook for the navigation to other pages
	const navigate: NavigateFunction = useNavigate();

	//Hook for the dispatch of the authentication state
	const dispatch: AppDispatch = useDispatch();

	//Hook for the form
	const {
		register,
		handleSubmit,
		setError,
		clearErrors,
		formState: { errors },
	} = useForm<LoginWithJWTRequest>();

	//Handler for the form submission
	const onSubmit: SubmitHandler<LoginWithJWTRequest> = async (
		data: LoginWithJWTRequest,
	) => {
		try {
			await loginThroughJWT(data);
			dispatch(authenticationSlice.actions.setUsersAuthenticationState(true));
			navigate('/'); //TODO:Redirect to the home
		} catch (error: any) {
			console.log(error);
			if (error.response?.status === 401) {
				notify(
					'Invalid password',
					'Invalid password. Please try again.',
					'error',
				);
				return;
			}

			if (error.response?.status === 500) {
				notify(
					'Unable to sign in',
					'An unknown error occurred in the server. Please try again.',
					'error',
				);
				return;
			}

			notify(
				'Unable to sign in',
				'An unknown error occurred. Please try again.',
				'error',
			);
			return;
		}
	};

	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack gap="4" align="center">
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
						requiredLabel={false}
						onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
							if (emailRegex.test(event.target.value)) {
								clearErrors('email');
								const email: string = event.target.value;
								const emailExists: boolean = await checkEmailExists(email);
								if (!emailExists) {
									setError('email', {
										message: 'No user with this email exists',
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
					<PasswordField
						errors={errors}
						register={register}
						required={true}
						requiredLabel={false}
					/>
					<ButtonWithHoverAnimations
						disabled={Object.keys(errors).length > 0}
						type="submit"
						onClick={() => {}}
						text="Sign In"
						className="w-[80%] mt-5"
					/>
				</Stack>
			</form>
		</>
	);
};
