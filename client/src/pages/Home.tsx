import { FunctionComponent } from 'react';
import { Hero } from '../components/home/Hero';
import { FunctionalitySection } from '../components/home/Functionality-Section';
import { AppDispatch } from '../store/store';
import { useDispatch } from 'react-redux';
import { setAnimatedBackground } from '../store/slices/animatedBackgroundSlice';
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
	return (
		<>
			<Hero />
			<FunctionalitySection />
		</>
	);
};
