import { useInView } from 'react-intersection-observer';
import { FunctionComponent } from 'react';
import { SpringValue, useSpring } from '@react-spring/web';
import { animated } from '@react-spring/web';
/**
 * This is the functionality section of the home page.
 * It is a section that shows the functionality of the platform.
 * @returns {JSX.Element}
 */

export const FunctionalitySection: FunctionComponent<{}> = (): JSX.Element => {
	const [ref, inView] = useInView({
		threshold: 0.5,
		triggerOnce: true,
	});

	const [animationStyles] = useSpring(() => ({
		from: {
			opacity: 0,
			transform: 'translateX(100%)',
		},
		to: {
			opacity: 1,
			transform: 'translateX(0)',
		},
	}));

	return <div className="dark:bg-slate-800 bg-white max-w-[100vw] w"></div>;
};
