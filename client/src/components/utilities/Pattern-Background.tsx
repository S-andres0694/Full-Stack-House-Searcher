import { useSpring, animated } from '@react-spring/web';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

/**
 * A component that creates a pattern background for the page
 * @param children - The children to be rendered inside the pattern background
 * @returns A component that creates a pattern background for the page
 */

export const PatternBackground: FunctionComponent<{
	children: React.ReactNode;
}> = ({ children }: { children: React.ReactNode }) => {
	//Determines if the animated background is enabled.
	const animatedBackground: boolean = useSelector(
		(state: RootState) => state.animatedBackground.animatedBackground,
	);

	//Creates the animated background.
	const [springs] = useSpring(() => ({
		from: { backgroundPosition: '0px 0px' },
		to: [
			{ backgroundPosition: '1000px 500px' },
			{ backgroundPosition: '0px 0px' },
		],
		loop: true,
		config: {
			duration: 10000, // 10 seconds per keyframe
		},
	}));

	return (
		<animated.div
			style={
				window.matchMedia('(prefers-reduced-motion: no-preference)').matches &&
				animatedBackground
					? springs
					: {}
			}
			className="bg-repeat flex-1 bg-white dark:bg-slate-800 w-full heropattern-overlappingcircles-slate-950 dark:heropattern-overlappingcircles-slate-700"
		>
			{children}
		</animated.div>
	);
};
