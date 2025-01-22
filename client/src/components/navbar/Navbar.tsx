import DarkModeToggle from './dark-mode-toggle';
import { Logo } from './Logo';
import { FunctionComponent } from 'react';
import { NavbarLinks } from './Navbar-Links';
/**
 * Navbar component
 * @returns {React.ReactNode} a div with the navbar
 */

export const Navbar: FunctionComponent = (): React.ReactNode => {
	return (
		<div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-slate-800 shadow-xl sticky top-0 z-50">
			<Logo />
			<div className="flex items-center gap-4">
				<NavbarLinks /> 
				<DarkModeToggle />
			</div>
		</div>
	);
};
