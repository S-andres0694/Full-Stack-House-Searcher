import { FunctionComponent } from 'react';
import { Hero } from '../components/home/Hero';
import { FunctionalitySection } from '../components/home/Functionality-Section';
/**
 * Home Page
 * @returns Home Page
 */

export const Home: FunctionComponent<{}> = () => {
	return (
		<>
			<Hero />
			<FunctionalitySection />
		</>
	);
};
