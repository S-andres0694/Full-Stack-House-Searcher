import { FunctionComponent, useEffect, useState } from 'react';
import { Stack } from '@chakra-ui/react';
import { AnimatedCards, animatedCards } from './AnimatedCards';

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
 * @returns {JSX.Element}
 */

export const FunctionalitySection: FunctionComponent<{
	animatedCards: animatedCards[];
}> = ({ animatedCards }): JSX.Element => {
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
		<Stack
			direction={currentWidth < 1024 ? 'column' : 'row'}
			gap={12}
			flexWrap="wrap"
			alignItems="center"
			justifyContent="center"
		>
			<AnimatedCards animatedCards={animatedCards} animationDuration={1000} />
		</Stack>
	);
};
