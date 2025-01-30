import { loginWithGoogleOAuth2 } from '../../services/authentication-services';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { IconButton } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { AnimatedComponent, useSpring } from '@react-spring/web';
import { animated } from '@react-spring/web';
import { authenticationSlice } from '../../store/slices/authenticationSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
/**
 * This component is used to login the user with Google OAuth2.
 * @returns A button that, when clicked, will login the user with Google OAuth2.
 */

export const LoginWithGoogleButton: React.FunctionComponent<{
	text?: string;
}> = ({ text = 'Sign in with Google' }) => {
	//This is used to navigate the user to the login page
	const navigate: NavigateFunction = useNavigate();

	//This is used to dispatch the authentication state
	const dispatch: AppDispatch = useDispatch();

	//This is used to animate the sign in button when the user hovers over it
	const [signInButtonHoverState, hoverAnimations] = useSpring(() => ({
		from: {
			scale: 1,
		},
		config: {
			duration: 50,
		},
	}));

	//This function is used to animate the sign in button when the user hovers over it
	const hoverAnimationsHandler = (): void => {
		hoverAnimations.start({
			scale: 0.95,
		});
	};

	//This function is used to animate the sign in button when the user hovers out of it
	const hoverAnimationsLeaveHandler = (): void => {
		hoverAnimations.start({
			scale: 1,
		});
	};

	//This function is used to handle the login with Google OAuth2
	const handleLoginWithGoogleOAuth2 = async (): Promise<void> => {
		try {
			await loginWithGoogleOAuth2();
			dispatch(authenticationSlice.actions.setUsersAuthenticationState(true));
		} catch (error) {
			console.error(error);
			navigate('/login');
		}
	};

	//Modify the IconButton to use the hover animations
	const IconButtonWithHoverAnimations: AnimatedComponent<typeof IconButton> =
		animated(IconButton);

	return (
		<IconButtonWithHoverAnimations
			onClick={handleLoginWithGoogleOAuth2}
			onMouseEnter={hoverAnimationsHandler}
			onMouseLeave={hoverAnimationsLeaveHandler}
			aria-label="Login with Google"
			rounded="full"
			className="bg-slate-800 dark:bg-white p-4 text-white dark:text-black"
			style={{
				...signInButtonHoverState,
				width: '80%',
			}}
		>
			<div className="flex justify-center items-center gap-2 w-full">
				<FcGoogle style={{ width: '10%', height: '10%' }} />
				<p className="text-white dark:text-black text-lg">{text}</p>
			</div>
		</IconButtonWithHoverAnimations>
	);
};
