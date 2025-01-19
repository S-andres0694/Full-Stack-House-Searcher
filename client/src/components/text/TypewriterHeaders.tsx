import { animated, useSprings } from '@react-spring/web';
import { FC, FunctionComponent } from 'react';

const TypewriterHeader: FunctionComponent<{ text: string, delayPerLetter: number }> = ({ text, delayPerLetter }) => {
    const textArray: string[] = text.split('');

	//This is used to animate the Log Into House Search text
    const animatedTextStyles = useSprings(
		textArray.length,
		textArray.map((_, i) => ({
			from: { opacity: 0, transform: 'translateY(10px)' },
			to: { opacity: 1, transform: 'translateY(0px)' },
			delay: i * delayPerLetter, // Delay each character
		})),
	);
	return (
		<div>
			{textArray.map((char, i) => (
				<animated.span key={i} style={animatedTextStyles[i]}>
					{char}
				</animated.span>
			))}
		</div>
	);
};

export default TypewriterHeader;
