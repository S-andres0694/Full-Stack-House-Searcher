import { Stack } from '@chakra-ui/react';
import { Button } from '../../components/ui/button';
import { useForm, SubmitHandler } from 'react-hook-form';
import { LoginWithJWTRequest } from '../../types/authentication-types';
import {
	loginThroughJWT,
	checkEmailExists,
} from '../../services/authentication-services';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import {
	animated,
	AnimatedComponent,
	easings,
	to,
	useSpring,
	useSprings,
} from '@react-spring/web';
import { InputField } from '../utilities/TextInputField';
import { PasswordField } from '../utilities/PasswordField';

/**
 * A form for logging in a user through JWT.
 * @returns A form for logging in a user through JWT.
 */

export const LoginForm: React.FunctionComponent<{}> = () => {
	//Hook for the navigation to other pages
	const navigate: NavigateFunction = useNavigate();

	//This is used to animate the sign in button when the user hovers over it
	const [signInButtonHoverStyles, signInButtonHoverAnimations] = useSpring(
		() => ({
			from: {
				scale: 1,
			},
			config: {
				duration: 50,
			},
		}),
	);

	//Hook for the form
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<LoginWithJWTRequest>();

	//Handler for the form submission
	const onSubmit: SubmitHandler<LoginWithJWTRequest> = async (
		data: LoginWithJWTRequest,
	) => {
		try {
			await loginThroughJWT(data);
			navigate('/dashboard'); //TODO:Redirect to the dashboard
		} catch (error) {
			console.error(error);
		}
	};

	//This function is used to animate the sign in button when the user hovers over it
	const hoverAnimationsHandler = (): void => {
		signInButtonHoverAnimations.start({
			scale: 0.95,
		});
	};

	//This function is used to animate the sign in button when the user hovers out of it
	const hoverAnimationsLeaveHandler = (): void => {
		signInButtonHoverAnimations.start({
			scale: 1,
		});
	};

	//Modify the Button to use the hover animations
	const ButtonWithHoverAnimations: AnimatedComponent<typeof Button> =
		animated(Button);

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack gap="4" align="center" maxW="md" maxH="xs">
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
					onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
						if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(event.target.value)) {
							const email: string = event.target.value;
							const emailExists: boolean = await checkEmailExists(email);
							if (!emailExists) {
								setError('email', {
									message: 'No user with this email exists',
								});
							}
						}
					}}
				/>
				<PasswordField errors={errors} register={register} />
				<ButtonWithHoverAnimations
					onMouseEnter={hoverAnimationsHandler}
					onMouseLeave={hoverAnimationsLeaveHandler}
					colorPalette="accent"
					className="dark:bg-slate-50 dark:text-black bg-slate-800 text-white px-4 py-2 text-lg mt-5"
					style={{
						width: '80%',
						...signInButtonHoverStyles,
					}}
					variant="solid"
					type="submit"
					rounded="full"
				>
					Sign In
				</ButtonWithHoverAnimations>
			</Stack>
		</form>
	);
};
