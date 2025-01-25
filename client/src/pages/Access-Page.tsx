import { LoginForm } from '../components/auth/LoginForm';
import { LoginWithGoogleButton } from '../components/auth/LoginWithGoogleButton';
import TypewriterAnimatedHeader from '../components/text/TypewriterHeaders';
import { Divider } from '../components/utilities/Divider';
import { SegmentedControl } from '../components/ui/segmented-control';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useState, Dispatch, SetStateAction } from 'react';
import { FunctionComponent } from 'react';
import { animated, useSpring } from '@react-spring/web';

/**
 * Access Page
 * @returns Access Page
 */

export const AccessPage: FunctionComponent = (): JSX.Element => {
	const startForm: string = 'Login';
	//State of the currently shown form
	const [selectedForm, setSelectedForm]: [
		string,
		Dispatch<SetStateAction<string>>,
	] = useState(startForm);

	//Animations for the register form switch
	const [formSwitchRegisterStyles] = useSpring(
		() => ({
			from: {
				opacity: 0,
				transform: 'translateX(-50%)',
			},
			to: {
				opacity: 1,
				transform: 'translateX(0)',
			},
			config: {
				tension: 280,
				friction: 20,
			},
			reset: true,
			immediate: false,
			key: selectedForm,
		}),
		[selectedForm],
	);

	//Animations for the login form switch
	const [formSwitchLoginStyles] = useSpring(
		() => ({
			from: {
				opacity: 0,
				transform: 'translateX(50%)',
			},
			to: {
				opacity: 1,
				transform: 'translateX(0)',
			},
			config: {
				tension: 280,
				friction: 20,
			},
			reset: true,
			immediate: false,
			key: selectedForm,
		}),
		[selectedForm],
	);

	return (
		<div
			className={`${
				selectedForm === 'Register' ? 'py-4' : ''
			} flex justify-center items-center min-h-[calc(100vh-64px)]`}
		>
			<div
				className={`max-w-xs md:max-w-sm lg:max-w-md space-y-4 p-8 bg-white dark:bg-slate-800 rounded-lg`}
			>
				<div className="flex flex-col items-center gap-4">
					<SegmentedControl
						items={['Login', 'Register']}
						defaultValue={startForm}
						size="lg"
						className="mx-auto rounded-lg"
						onChange={() =>
							setSelectedForm(selectedForm === 'Login' ? 'Register' : 'Login')
						}
					/>
					<h1 className="text-4xl font-bold text-center">
						{selectedForm === 'Login' ? (
							<TypewriterAnimatedHeader
								text={`Log Into House Searcher`}
								delayPerLetter={10}
								key={selectedForm}
							/>
						) : (
							<TypewriterAnimatedHeader
								text={`Sign Up For House Searcher`}
								delayPerLetter={10}
								key={selectedForm}
							/>
						)}
					</h1>
				</div>
				{selectedForm === 'Login' ? (
					<>
						<animated.div style={formSwitchLoginStyles}>
							<LoginForm />
							<div className="flex flex-col items-center gap-4 mt-4">
								<Divider text="OR" />
								<LoginWithGoogleButton text={`Sign in with Google`} />
							</div>
						</animated.div>
					</>
				) : (
					<>
						<animated.div style={formSwitchRegisterStyles}>
							<RegisterForm />
							<div className="flex flex-col items-center gap-4 mt-4">
								<Divider text="OR" />
								<LoginWithGoogleButton text={`Sign up with Google`} />
							</div>
						</animated.div>
					</>
				)}
			</div>
		</div>
	);
};
