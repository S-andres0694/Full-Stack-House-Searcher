import { Card, CardBody, Image } from '@chakra-ui/react';
import TypewriterAnimatedHeader from '../text/TypewriterHeaders';
import { animatedCards } from './AnimatedCards';
import {
	SpringValue,
	useSpring,
	config,
	animated,
	AnimatedComponent,
} from '@react-spring/web';
import { FaFlask } from 'react-icons/fa';
import { MouseEventHandler } from 'react';
/**
 * Styles for the animated cards.
 * @interface animatedCardsStyles
 * @property {SpringValue<string>} transform - The transform property for the animated cards.
 */

interface animatedCardsStyles {
	transform: SpringValue<string>;
}

/**
 * FunctionCards is a component that displays a card with an image, title, description, and buttons.
 * It is used to display the functionality of the app.
 *
 * @param animatedCards - The cards to display.
 * @returns A card with an image, title, description, and buttons.
 */

export const FunctionCards = ({
	title,
	description,
	image,
	futureFeature,
}: animatedCards) => {
	// Animate the card when it is hovered over.
	const [animationStyles, animationHandler]: [animatedCardsStyles, any] =
		useSpring(() => ({
			transform: 'scale(1)',
			config: { ...config.wobbly },
		}));

	// Animate the card when it is hovered over.
	const handleHover: MouseEventHandler<HTMLDivElement> = () => {
		animationHandler.start({ transform: 'scale(1.1)' });
	};

	// Animate the card when it is not hovered over.
	const handleLeave: MouseEventHandler<HTMLDivElement> = () => {
		animationHandler.start({ transform: 'scale(1)' });
	};

	// Animate the card body.
	const AnimatedCardRoot: AnimatedComponent<typeof Card.Root> = animated(
		Card.Root,
	);

	return (
		<AnimatedCardRoot
			maxW="sm"
			overflow="hidden"
			rounded="lg"
			className="shadow-lg shadow-black"
			onMouseEnter={handleHover}
			onMouseLeave={handleLeave}
			style={{ ...animationStyles }}
		>
			<Image
				//src={image}
				src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
				alt={title}
			/>
			<CardBody
				gap="2"
				className="flex flex-col items-center justify-center pb-4 dark:bg-gray-800 bg-gray-100"
			>
				<TypewriterAnimatedHeader
					text={title}
					delayPerLetter={100}
					className="text-2xl font-bold text-gray-800 dark:text-gray-200"
				/>
				<TypewriterAnimatedHeader
					text={description as string}
					delayPerLetter={10}
					className="text-sm font-medium text-gray-800 dark:text-gray-200"
					centerText={true}
				/>
				{futureFeature && (
					<hr className="w-[90%] mt-2 border border-slate-700 dark:border-slate-400" />
				)}
			</CardBody>

			{futureFeature && (
				<>
					<Card.Footer
						className="flex items-start justify-center dark:bg-gray-800 bg-gray-100"
						gap="2"
					>
						<FaFlask className="text-gray-800 relative -top-2 dark:text-gray-300 text-5xl" />
						<p className="text-sm dark:text-gray-300 text-gray-800 font-ibm-plex-sans">
							<span className="font-bold">
								*This feature is still on development.
							</span>
							We (me the only current dev) are working hard to make it better
							for you.
						</p>
					</Card.Footer>
				</>
			)}
		</AnimatedCardRoot>
	);
};
