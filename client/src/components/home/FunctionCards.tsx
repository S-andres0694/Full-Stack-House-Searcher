import { Card, CardBody, CardFooter, Image } from '@chakra-ui/react';
import TypewriterAnimatedHeader from '../text/TypewriterHeaders';
import { animatedCards } from './AnimatedCards';
import {
	SpringValue,
	useSpring,
	config,
	animated,
	AnimatedComponent,
	easings,
} from '@react-spring/web';
import { FaFlask } from 'react-icons/fa';
import { Dispatch, MouseEventHandler, SetStateAction, useState } from 'react';
import { useColorMode } from '../ui/color-mode';
/**
 * Styles for the animated cards.
 * @interface animatedCardsStyles
 * @property {SpringValue<string>} transform - The transform property for the animated cards.
 */

interface animatedCardsStyles {
	transform: SpringValue<string>;
	background: SpringValue<string>;
	boxShadow: SpringValue<string>;
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
	// Add state to monitor the theme.
	const { colorMode } = useColorMode();

	// Keeps state of the message of the typewriter header
	const [isHovered, setIsHovered]: [
		boolean,
		Dispatch<SetStateAction<boolean>>,
	] = useState(false);

	// Add state to monitor reset trigger
	const [resetTrigger, setResetTrigger] = useState(false);

	// Animate the card when it is hovered over.
	const [scaleAnimationStyles, scaleAnimationHandler]: [
		animatedCardsStyles,
		any,
	] = useSpring(() => ({
		transform: 'scale(1)',
		background: 'rgba(0, 0, 0, 0)',
		boxShadow: '0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0px rgba(0,0,0,0)',
		config: (key: string) => {
			if (key === 'transform' || key === 'boxShadow') {
				return {
					...config.wobbly,
					delay: 100,
					duration: 200,
					easing: easings.easeOutElastic,
				};
			}
			return { ...config.wobbly, duration: 200 };
		},
	}));

	// Animate the card when it is hovered over.
	const handleHover: MouseEventHandler<HTMLDivElement> = () => {
		scaleAnimationHandler.start({
			transform: 'scale(1.1)',
			background:
				colorMode === 'dark' ? 'rgba(31, 41, 55, 1)' : 'rgba(243, 244, 246, 1)',
			boxShadow:
				'0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
		});
	};

	// Animate the card when it is not hovered over.
	const handleLeave: MouseEventHandler<HTMLDivElement> = () => {
		scaleAnimationHandler.start({
			transform: 'scale(1)',
			background: 'rgba(0, 0, 0, 0)',
			boxShadow: '0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0px rgba(0,0,0,0)',
		});
	};

	// Animate the card root.
	const AnimatedCardRoot: AnimatedComponent<typeof Card.Root> = animated(
		Card.Root,
	);

	// Animate the card body.
	const AnimatedCardBody: AnimatedComponent<typeof CardBody> =
		animated(CardBody);

	// Animate the card footer.
	const AnimatedCardFooter: AnimatedComponent<typeof CardFooter> =
		animated(CardFooter);

	return (
		<AnimatedCardRoot
			maxW="md"
			overflow="hidden"
			rounded="lg"
			className="px-3 pt-2 animated-card"
			onMouseEnter={(event: React.MouseEvent<HTMLDivElement>) => {
				setIsHovered(true);
				handleHover(event);
				setResetTrigger((prev: boolean) => !prev);
			}}
			onMouseLeave={(event: React.MouseEvent<HTMLDivElement>) => {
				setIsHovered(false);
				handleLeave(event);
				setResetTrigger((prev: boolean) => !prev);
			}}
			style={{ ...scaleAnimationStyles }}
		>
			<Image
				//src={image}
				src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
				alt={title}
				rounded="lg"
				className="shadow-md shadow-black dark:shadow-white-900"
			/>
			<AnimatedCardBody
				gap="2"
				className={`flex flex-col items-center justify-center ${
					futureFeature ? 'pb-4' : ''
				}`}
			>
				<TypewriterAnimatedHeader
					text={title}
					delayPerLetter={100}
					className={`text-2xl font-bold text-gray-800 dark:text-gray-200 ${
						isHovered ? '' : 'hidden'
					} `}
					resetTrigger={resetTrigger}
				/>
				<TypewriterAnimatedHeader
					text={description}
					delayPerLetter={6.5}
					className={`text-sm font-medium text-gray-800 dark:text-gray-200  ${
						isHovered ? '' : 'hidden'
					}`}
					resetTrigger={resetTrigger}
					centerText={true}
				/>
				{futureFeature && isHovered && (
					<hr className="w-[90%] mt-2 border border-slate-700 dark:border-slate-400" />
				)}
			</AnimatedCardBody>
			{futureFeature && isHovered && (
				<>
					<AnimatedCardFooter
						className="flex items-start justify-center"
						gap="2"
					>
						<FaFlask className="text-gray-800 relative -top-2 dark:text-gray-300 text-5xl" />
						<p className="text-sm dark:text-gray-300 text-gray-800 font-ibm-plex-sans">
							<span className="font-bold">
								*This feature is still on development.
							</span>
							<span> </span>
							We (me the only current dev) are working hard to make it better
							for you.
						</p>
					</AnimatedCardFooter>
				</>
			)}
		</AnimatedCardRoot>
	);
};
