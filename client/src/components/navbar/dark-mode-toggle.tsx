import { useColorMode } from '../ui/color-mode';
import { MouseEventHandler, useEffect } from 'react';
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { useSpring, animated, AnimatedComponent } from '@react-spring/web';
import { IconButton } from '@chakra-ui/react';
/**
 * This component is used to toggle the dark mode.
 * @returns A button that, when clicked, will toggle the dark mode.
 */

export const DarkModeToggle: React.FunctionComponent = () => {
	const { colorMode, toggleColorMode } = useColorMode();
	const [springs, animation] = useSpring(() => ({
		scale: 1,
		config: { duration: 50 },
	}));

	//Handle the hover animation
	const handleHover: MouseEventHandler<HTMLButtonElement> = () => {
		animation.start({
			from: {
				scale: 1,
			},
			to: {
				scale: 1.3,
			},
		});
	};

	//Handle the mouse leave animation
	const handleMouseLeave: MouseEventHandler<HTMLButtonElement> = () => {
		animation.start({
			from: {
				scale: 1.3,
			},
			to: {
				scale: 1,
			},
		});
	};

	//Sync the color mode with the system's color mode
	useEffect(() => {
		const root: HTMLElement = window.document.documentElement;
		if (colorMode === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	}, [colorMode]);

	//Wrap the IconButton with animated to apply the spring animation
	const AnimatedIconButton: AnimatedComponent<typeof IconButton> =
		animated(IconButton);

	return (
		<AnimatedIconButton
			aria-label="Toggle dark mode button"
			onMouseEnter={handleHover}
			onMouseLeave={handleMouseLeave}
			size="lg"
			rounded="full"
			variant="ghost"
			className={`${colorMode === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}
			onClick={toggleColorMode}
			style={springs}
		>
			<DarkModeSwitch
				checked={colorMode === 'dark'}
				onChange={toggleColorMode}
				size={120}
			/>
		</AnimatedIconButton>
	);
};

export default DarkModeToggle;
