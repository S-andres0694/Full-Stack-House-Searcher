export const PatternBackground = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return (
		<div
			className={`bg-repeat bg-white dark:bg-slate-950 w-full h-full min-h-screen heropattern-overlappingcircles-slate-950 dark:heropattern-deathstar-slate-700 flex items-center justify-center`}
		>
			{children}
		</div>
	);
};
