import { loginWithGoogleOAuth2 } from '../../services/authentication-services';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { IconButton } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';

/**
 * This component is used to login the user with Google OAuth2.
 * @returns A button that, when clicked, will login the user with Google OAuth2.
 */

export const LoginWithGoogleButton: React.FunctionComponent<{}> = () => {
	const navigate: NavigateFunction = useNavigate();
	const handleLoginWithGoogleOAuth2 = async (): Promise<void> => {
		try {
			await loginWithGoogleOAuth2();
		} catch (error) {
			console.error(error);
			navigate('/login');
		}
	};
	return (
		<IconButton
			onClick={handleLoginWithGoogleOAuth2}
			aria-label="Login with Google"
			rounded="full"
			className="bg-slate-800 dark:bg-white p-4 text-white dark:text-black"
			css={{
				width: '80%',
			}}
		>
			<div className="flex justify-center items-center gap-2 w-full">
				<FcGoogle style={{ width: '10%', height: '10%' }} />
				<p className="text-white dark:text-black text-lg">
					Sign in with Google
				</p>
			</div>
		</IconButton>
	);
};
