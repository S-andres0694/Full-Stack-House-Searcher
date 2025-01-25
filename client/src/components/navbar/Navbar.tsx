import DarkModeToggle from './dark-mode-toggle';
import { Logo } from './Logo';
import { FunctionComponent } from 'react';
import { NavbarLinks } from './Navbar-Links';
import { LinksProps } from './Links';
import { LoginNavbarButton } from '../auth/LoginNavbarButton';
import { NavigateFunction } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

//TODO: Change the links to the actual links
export const links: LinksProps[] = [
	{ label: 'Home', to: '/' },
	{ label: 'Random', to: '/2' },
	{ label: 'Random', to: '/3' },
	{ label: 'Random', to: '/4' },
	{ label: 'Random', to: '/5' },
];

/**
 * Navbar component
 * @returns {React.ReactNode} a div with the navbar
 */

export const Navbar: FunctionComponent<{
	links: LinksProps[];
}> = ({ links }): React.ReactNode => {
	//Hook for the navigation
	const navigate: NavigateFunction = useNavigate();

	//Hook for the authentication state
	const userIsAuthenticated: boolean = useSelector<RootState, boolean>(
		(state: RootState) => state.authentication.userIsAuthenticated,
	);

	return (
		<div className="flex justify-between items-center p-2 sm:p-4 bg-gray-100 dark:bg-slate-800 shadow-xl sticky top-0 z-50">
			<Logo />
			<div className="flex items-center gap-1 sm:gap-3">
				{!userIsAuthenticated && (
					<LoginNavbarButton
						onClick={() => navigate('/login')}
						text="Sign In"
						type="button"
					/>
				)}
				{window.innerWidth > 768 ? (
					<>
						<NavbarLinks links={links} />
						<DarkModeToggle />
					</>
				) : (
					<>
						<DarkModeToggle />
						<NavbarLinks links={links} />
					</>
				)}
			</div>
		</div>
	);
};
