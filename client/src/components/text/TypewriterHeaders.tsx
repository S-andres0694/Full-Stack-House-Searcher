import { animated, SpringValue, useSprings } from '@react-spring/web';
import { FunctionComponent } from 'react';

/**
 * This is a component that animates the text in a typewriter effect.
 * @param text - The text to animate.
 * @param delayPerLetter - The delay between each letter.
 * @returns A component that animates the text in a typewriter effect.
 */

const TypewriterAnimatedHeader: FunctionComponent<{
	text: string;
	delayPerLetter: number;
}> = ({ text, delayPerLetter }) => {
	const textArray: string[] = text.split('');
	const animatedTextStyles: {
		opacity: SpringValue<number>;
		transform: SpringValue<string>;
	}[] = useSprings(
		textArray.length,
		textArray.map((_, i) => ({
			from: { opacity: 0, transform: 'translateY(10px)' },
			to: { opacity: 1, transform: 'translateY(0px)' },
			delay: i * delayPerLetter, // Delay each character
		})),
	);
	return (
		<div>
			{textArray.map((letter: string, index: number) => (
				<animated.span
					key={`${letter}-${index}`}
					style={animatedTextStyles[index]}
				>
					{letter}
				</animated.span>
			))}
		</div>
	);
};

export default TypewriterAnimatedHeader;
