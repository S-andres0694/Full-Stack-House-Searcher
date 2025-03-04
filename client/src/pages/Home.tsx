import { FunctionComponent } from 'react';
import { Hero } from '../components/home/Hero';
import { FunctionalitySection } from '../components/home/Functionality-Section';
import { AppDispatch } from '../store/store';
import { useDispatch } from 'react-redux';
import { setAnimatedBackground } from '../store/slices/animatedBackgroundSlice';
import { animatedCards } from '../components/home/AnimatedCards';
import { TestimonialSection } from '../components/home/TestimonialSection';
/**
 * Home Page
 * @returns Home Page
 */

export const Home: FunctionComponent<{ animatedBackground: boolean }> = ({
	animatedBackground,
}: {
	animatedBackground: boolean;
}) => {
	//Hook for the dispatch of the animated background state
	const dispatch: AppDispatch = useDispatch();
	//Sets the animated background state
	dispatch(setAnimatedBackground(animatedBackground));

	//TODO: This is a mock array of animated cards.
	const animatedCards: animatedCards[] = [
		{
			title: 'Card 1',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
		},
		{
			title: 'Card 2',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
		},
		{
			title: 'Card 3',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
			futureFeature: true,
		},
		{
			title: 'Card 4',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
			futureFeature: true,
		},
	];

	return (
		<div className="max-w-[100vw] max-h-[100vh] flex flex-col gap-6 bg-white dark:bg-slate-800">
			<Hero />
			<FunctionalitySection animatedCards={animatedCards} />
		</div>
	);
};
