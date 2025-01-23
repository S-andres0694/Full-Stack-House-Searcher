import { animated, SpringValue, useSprings } from '@react-spring/web';
import { FunctionComponent } from 'react';

/**
 * This is a component that animates the text in a typewriter effect.
 * @param text - The text to animate.
 * @param delayPerLetter - The delay between each letter.
 * @param colorAnimation - Array of hex colors for animation
 * @param colorAnimationEndIndex - New prop to specify where color animation ends
 * @returns A component that animates the text in a typewriter effect.
 */

const TypewriterAnimatedHeader: FunctionComponent<{
	text: string;
	delayPerLetter: number;
	className?: string;
	colorAnimation?: string[]; // Array of hex colors for animation
	colorAnimationEndIndex?: number; // New prop to specify where color animation ends
}> = ({ text, delayPerLetter, className, colorAnimation, colorAnimationEndIndex }) => {
	const textArray: string[] = text.split('');
	const animatedTextStyles: {
		opacity: SpringValue<number>;
		transform: SpringValue<string>;
		color?: SpringValue<string>;
	}[] = useSprings(
		textArray.length,
		textArray.map((_, i: number) => ({
			from: {
				opacity: 0,
				transform: 'translateY(10px)',
				color: colorAnimation && (colorAnimationEndIndex === undefined || i <= colorAnimationEndIndex)
					? colorAnimation[0]
					: undefined
			},
			to: async (next: any) => {
				await next({ opacity: 1, transform: 'translateY(0px)' });

				if (colorAnimation && (colorAnimationEndIndex === undefined || i <= colorAnimationEndIndex)) {
					while (true) {
						await new Promise(resolve => setTimeout(resolve, 750));
						for (const color of colorAnimation) {
							await next({ color: color });
						}
					}
				}
			},
			delay: i * delayPerLetter,
			config: {}
		})),
	);
	return (
		<div>
			{textArray.map((letter: string, index: number) => (
				<animated.span
					key={`${letter}-${index}`}
					style={animatedTextStyles[index]}
					className={className}
				>
					{letter}
				</animated.span>
			))}
		</div>
	);
};

export default TypewriterAnimatedHeader;
