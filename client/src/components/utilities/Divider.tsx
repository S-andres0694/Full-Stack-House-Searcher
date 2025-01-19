/**
 * Divider component that inserts text between two horizontal lines
 * @param {string} text - The text to insert between the two horizontal lines
 * @returns {React.ReactNode} a div with two horizontal lines and text in the middle
 */

export const Divider: React.FunctionComponent<{ text: string }> = ({
	text,
}: {
	text: string;
}): React.ReactNode => {
	return (
		<div className="flex items-center">
			<hr className="w-44 border-t border border-gray-300 dark:border-gray-700" />
			<span className="px-3 text-gray-500">{text}</span>
			<hr className="w-44 border-t border border-gray-300 dark:border-gray-700" />
		</div>
	);
};
