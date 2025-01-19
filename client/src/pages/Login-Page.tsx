import { LoginForm } from '../components/auth/LoginForm';
import { LoginWithGoogleButton } from '../components/auth/LoginWithGoogleButton';
import { Divider } from '../components/utilities/Divider';
import { DarkModeToggle } from '../components/navbar/dark-mode-toggle';
import { PatternBackground } from '../components/utilities/Pattern-Background';

export const LoginPage = () => {
	return (
			<PatternBackground>
			<div className="max-w-md w-full space-y-4 p-8 bg-white dark:bg-slate-800 rounded-lg shadow ">
				<DarkModeToggle />
					<h1 className="text-4xl font-bold text-center">
						Log into House Searcher
					</h1>
					<LoginForm />
					<div className="flex flex-col items-center gap-4">
						<Divider text="OR" />
						<LoginWithGoogleButton />
					</div>
				</div>
			</PatternBackground>
		
	);
};

