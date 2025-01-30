import { animated, useSprings } from '@react-spring/web';
import { FunctionComponent, useEffect } from 'react';

/**
 * This is a component that animates the text in a typewriter effect.
 * @param text - The text to animate.
 * @param delayPerLetter - The delay between each letter.
 * @param colorAnimation - Array of hex colors for animation
 * @param colorAnimationEndIndex - New prop to specify where color animation ends
 * @param resetTrigger - Allows you to reset the animation through state manipulation.
 * @returns A component that animates the text in a typewriter effect.
 */

const TypewriterAnimatedHeader: FunctionComponent<{
	text: string;
	delayPerLetter: number;
	className?: string;
	colorAnimation?: string[]; // Array of hex colors for animation
	colorAnimationEndIndex?: number; // New prop to specify where color animation ends
	centerText?: boolean;
	resetTrigger?: boolean;
}> = ({
	text,
	delayPerLetter,
	className,
	colorAnimation,
	colorAnimationEndIndex,
	centerText,
	resetTrigger,
}) => {
	// Only create the text array if resetTrigger is undefined or true
	const textArray: string[] =
		resetTrigger === undefined || resetTrigger ? text.split('') : ['']; // Empty array when resetTrigger is false

	/*
	 * Use springs to animate each character individually. Also applies the color animation if the color is passed.
	 */
	const [springs, api] = useSprings(textArray.length, (i: number) => ({
		from: {
			opacity: 0,
			transform: 'translateY(10px)',
			color:
				colorAnimation &&
				(colorAnimationEndIndex === undefined || i <= colorAnimationEndIndex)
					? colorAnimation[0]
					: undefined,
		},
		to: async (next: any) => {
			if (resetTrigger === undefined || resetTrigger) {
				await next({ opacity: 1, transform: 'translateY(0px)' });

				if (
					colorAnimation &&
					(colorAnimationEndIndex === undefined || i <= colorAnimationEndIndex)
				) {
					while (true) {
						await new Promise((resolve) => setTimeout(resolve, 750));
						for (const color of colorAnimation) {
							await next({ color: color });
						}
					}
				}
			} else {
				await next({ opacity: 0, transform: 'translateY(10px)' });
			}
		},
		delay: i * delayPerLetter,
		config: {},
	}));

	useEffect(() => {
		if (resetTrigger !== undefined) {
			// Reset the springs with new text array length
			api.start((i) => ({
				to: async (next: any) => {
					if (resetTrigger) {
						await next({ opacity: 1, transform: 'translateY(0px)' });

						if (
							colorAnimation &&
							(colorAnimationEndIndex === undefined ||
								i <= colorAnimationEndIndex)
						) {
							while (true) {
								await new Promise((resolve) => setTimeout(resolve, 750));
								for (const color of colorAnimation) {
									await next({ color: color });
								}
							}
						}
					} else {
						await next({ opacity: 0, transform: 'translateY(10px)' });
					}
				},
				delay: i * delayPerLetter,
			}));
		}
	}, [resetTrigger]);

	return (
		<div className={centerText ? 'text-center' : ''}>
			{textArray.map((letter: string, index: number) => (
				<animated.span
					key={`${letter}-${index}`}
					style={springs[index]}
					className={className}
				>
					{resetTrigger === false ? '' : letter}
				</animated.span>
			))}
		</div>
	);
};
export default TypewriterAnimatedHeader;
