import { useSpring, animated } from '@react-spring/web';

/**
 * Divider component that inserts text between two horizontal lines
 * @param {string} text - The text to insert between the two horizontal lines
 * @returns {React.ReactNode} a div with two horizontal lines and text in the middle
 */

export const Divider: React.FunctionComponent<{
	text: string;
}> = ({ text }: { text: string }): React.ReactNode => {
	const [spring] = useSpring(() => ({
		from: {
			transform: 'scaleX(0%)',
		},
		to: {
			transform: 'scaleX(100%)',
		},
		config: {
			duration: 200,
		},
	}));
	return (
		<div className="w-full sm:w-3/4 md:w-3/4 lg:w-full flex items-center">
			<animated.hr
				style={spring}
				className={`w-full border-t border border-gray-300 dark:border-gray-700`}
			/>
			<span className="px-3 text-gray-500">{text}</span>
			<animated.hr
				style={spring}
				className={`w-full border-t border border-gray-300 dark:border-gray-700`}
			/>
		</div>
	);
};
