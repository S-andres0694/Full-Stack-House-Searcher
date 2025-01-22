import {
	Dispatch,
	FunctionComponent,
	SetStateAction,
	useEffect,
	useState,
} from 'react';
import { Links } from './Links';
import { GiHamburgerMenu } from 'react-icons/gi';
import { IconButton } from '@chakra-ui/react';
import { useTransition } from '@react-spring/web';
import { animated } from '@react-spring/web';

export const NavbarLinks: FunctionComponent = (): React.ReactNode => {
	// States keeping track of viewport width and whether the menu is open
	const [viewportWidth, setViewportWidth]: [
		number,
		Dispatch<SetStateAction<number>>,
	] = useState(window.innerWidth);
	const [isOpen, setIsOpen]: [boolean, Dispatch<SetStateAction<boolean>>] =
		useState(false);

	const transitions = useTransition(isOpen, {
		from: { transform: 'translateX(100%)', opacity: 0 },
		enter: { transform: 'translateX(0%)', opacity: 1 },
		leave: { transform: 'translateX(100%)', opacity: 0 },
		config: {
			duration: 100,
		},
	});

	useEffect(() => {
		// Handler to call on window resize
		const handleResize: () => void = () => {
			setViewportWidth(window.innerWidth);
		};

		// Add event listener
		window.addEventListener('resize', handleResize);

		// Remove event listener on cleanup
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		setIsOpen(false);
	}, [viewportWidth]);

	return (
		<>
			{viewportWidth < 1024 ? (
				<>
					<IconButton
						aria-label="Menu"
						onClick={() => {
							setIsOpen(!isOpen);
						}}
					>
						<GiHamburgerMenu />
					</IconButton>
					{transitions(
						(style, show) =>
							show && (
								<animated.div
									style={style}
									className="absolute bg-gray-100 rounded-lg dark:bg-slate-800 top-16 right-0 shadow-lg p-4 flex flex-col gap-2"
								>
									<Links label="Dashboard" to="/dashboard" />
									<Links label="Dashboard" to="/dashboard" />
									<Links label="Dashboard" to="/dashboard" />
									<Links label="Dashboard" to="/dashboard" />
									<Links label="Dashboard" to="/dashboard" />
								</animated.div>
							),
					)}
				</>
			) : (
				<div className="flex items-center gap-2">
					<Links label="Dashboard" to="/dashboard" />
					<Links label="Dashboard" to="/dashboard" />
					<Links label="Dashboard" to="/dashboard" />
					<Links label="Dashboard" to="/dashboard" />
					<Links label="Dashboard" to="/dashboard" />
				</div>
			)}
		</>
	);
};
