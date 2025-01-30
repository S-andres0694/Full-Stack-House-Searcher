import { FunctionComponent } from 'react';
import { animated, config, SpringValue, useSprings } from '@react-spring/web';
import { Card, Image, Text, Button } from '@chakra-ui/react';
import { FunctionCards } from './FunctionCards';

/**
 * Animated Card Props
 * @interface animatedCardProps
 * @property {animatedCards[]} animatedCards - The animated cards to animate
 * @property {number} animationDuration - The duration of the animation
 */

interface animatedCardProps {
	animatedCards: animatedCards[];
	animationDuration: number;
}

/**
 * Animated Cards
 * @interface animatedCards
 * @property {string} text - The text of the card
 * @property {string} image - The image of the card
 * @property {string} description - The description of the card
 * @property {string} color - The color of the card
 */

export interface animatedCards {
	title: string;
	description: string;
	image?: string;
	futureFeature?: boolean;
}

/**
 * Animation Styles
 * @interface animationStyles
 * @property {SpringValue<string>} transform - The transform of the animation
 * @property {SpringValue<number>} opacity - The opacity of the animation
 */

interface animationStyles {
	transform: SpringValue<string>;
	opacity: SpringValue<number>;
}

/**
 * Animated Cards
 * @param animatedCards - The animated cards to animate
 * @param animationDuration - The duration of the animation
 * @returns Animated Cards
 */

export const AnimatedCards: FunctionComponent<animatedCardProps> = ({
	animatedCards,
	animationDuration,
}: animatedCardProps): JSX.Element => {
	// Animations for the turning cards
	const [animationStyles, _]: [animationStyles[], any] = useSprings(
		animatedCards.length,
		(index: number) => ({
			from: {
				transform: 'translateY(100%)',
				opacity: 0,
			},
			to: {
				transform: 'translateY(0%)',
				opacity: 1,
			},
			config: {
				...config.wobbly,
			},
			delay: (animationDuration * index) / 2,
		}),
		[animatedCards.length],
	);

	return (
		<>
			{animationStyles.map(
				(animationStyles: animationStyles, index: number) => (
					<animated.div
						className="overflow-visible"
						key={index}
						style={{ ...animationStyles }}
					>
						<FunctionCards
							title={animatedCards[index].title}
							description={animatedCards[index].description}
							image={animatedCards[index].image}
							futureFeature={animatedCards[index].futureFeature}
						/>
					</animated.div>
				),
			)}
		</>
	);
};
