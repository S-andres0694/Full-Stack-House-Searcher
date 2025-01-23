import DarkModeToggle from './dark-mode-toggle';
import { Logo } from './Logo';
import { FunctionComponent } from 'react';
import { NavbarLinks } from './Navbar-Links';
import { LinksProps } from './Links';
import { LoginNavbarButton } from '../auth/LoginNavbarButton';
import { NavigateFunction } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

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
	links: LinksProps[],
	loginButton: boolean;
}> = ({ links, loginButton }): React.ReactNode => {
	const navigate: NavigateFunction = useNavigate();
	return (
		<div className="flex justify-between items-center p-4 pr-6 bg-gray-100 dark:bg-slate-800 shadow-xl sticky top-0 z-50">
			<Logo />
			<div className="flex items-center gap-3">
				{loginButton && (
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
