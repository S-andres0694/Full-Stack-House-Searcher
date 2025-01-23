import { animated, AnimatedComponent, useSpring } from '@react-spring/web';
import { FunctionComponent } from 'react';
import { Button } from '../ui/button';

export const ButtonWithHoverAnimations: FunctionComponent<{
	type: 'submit' | 'button';
	onClick: () => void;
	text: string;
	disabled?: boolean;
	className?: string;
}> = ({ type, onClick, text, disabled, className }) => {
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
		<ButtonWithHoverAnimations
			onMouseEnter={hoverAnimationsHandler}
			onMouseLeave={hoverAnimationsLeaveHandler}
			colorPalette="accent"
			onClick={onClick}
			className={`dark:bg-slate-50 dark:text-black bg-slate-800 text-white px-4 py-2 text-lg mt-5 ${className}`}
			style={{
				...signInButtonHoverStyles,
			}}
			variant="solid"
			type={type}
			rounded="full"
			disabled={disabled}
		>
			{text}
		</ButtonWithHoverAnimations>
	);
};

export default ButtonWithHoverAnimations;
