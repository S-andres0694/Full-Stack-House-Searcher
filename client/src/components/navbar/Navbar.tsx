import DarkModeToggle from './dark-mode-toggle';
import { Logo } from './Logo';
import { FunctionComponent } from 'react';
import { NavbarLinks } from './Navbar-Links';
import { LinksProps } from './Links';

//TODO: Change the links to the actual links
const links: LinksProps[] = [
	{ label: 'Random', to: '/1' },
	{ label: 'Random', to: '/2' },
	{ label: 'Random', to: '/3' },
	{ label: 'Random', to: '/4' },
	{ label: 'Random', to: '/5' },
];

/**
 * Navbar component
 * @returns {React.ReactNode} a div with the navbar
 */

export const Navbar: FunctionComponent = (): React.ReactNode => {
	return (
		<div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-slate-800 shadow-xl sticky top-0 z-50">
			<Logo />
			<div className="flex items-center gap-4">
				<NavbarLinks links={links} />
				<DarkModeToggle />
			</div>
		</div>
	);
};
