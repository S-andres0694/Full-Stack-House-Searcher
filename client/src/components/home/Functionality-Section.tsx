import { FunctionComponent, useEffect, useState } from 'react';
import { Stack } from '@chakra-ui/react';
import { AnimatedCards, animatedCards } from './AnimatedCards';
import TypewriterAnimatedHeader from '../text/TypewriterHeaders';

/**
 * The interface for the animated cards.
 * @interface animatedCards
 * @property {string} text - The text of the card.
 * @property {string} image - The image of the card.
 * @property {string} description - The description of the card.
 * @property {string} color - The color of the card.
 */

/**
 * This is the functionality section of the home page.
 * It is a section that shows the functionality of the platform.
 * @returns {React.ReactNode}
 */

export const FunctionalitySection: FunctionComponent<{
	animatedCards: animatedCards[];
}> = ({ animatedCards }): React.ReactNode => {
	// Keep track of the current width of the window for responsive design.
	const [currentWidth, setCurrentWidth] = useState<number>(window.innerWidth);

	// Add an event listener to the window to update the current width when the window is resized.
	useEffect(() => {
		// Handler to call on window resize
		const handleResize: () => void = () => {
			setCurrentWidth(window.innerWidth);
		};

		// Add event listener
		window.addEventListener('resize', handleResize);

		// Remove event listener on cleanup
		return () => window.removeEventListener('resize', handleResize);
	}, [currentWidth]);

	// Render the functionality section.
	return (
		<>
			<div className="bg-white dark:bg-slate-800 max-w-[100vw]">
				<TypewriterAnimatedHeader
					text="Features"
					delayPerLetter={100}
					className="text-4xl font-bold dark:text-slate-100 text-slate-800"
					centerText={true}
				/>
			</div>
			<Stack
				direction={currentWidth < 1024 ? 'column' : 'row'}
				gap={5}
				alignItems={currentWidth < 1024 ? 'center' : 'start'}
				justifyContent="center"
				flex={1}
				flexWrap={currentWidth < 1024 ? 'wrap' : 'nowrap'}
				minWidth="0"
				className="dark:bg-slate-800 bg-white max-w-[100vw] border-b-4 border-slate-800 dark:border-gray-300"
			>
				<AnimatedCards animatedCards={animatedCards} animationDuration={1000} />
			</Stack>
		</>
	);
};
