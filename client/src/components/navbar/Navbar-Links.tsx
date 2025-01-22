import { FunctionComponent } from "react";
import { Links } from "./Links";

export const NavbarLinks: FunctionComponent = (): React.ReactNode => {
	return (
		<div className="flex items-center gap-2">
			<Links label="Dashboard" to="/dashboard" />
			<Links label="Dashboard" to="/dashboard" />
			<Links label="Dashboard" to="/dashboard" />
			<Links label="Dashboard" to="/dashboard" />
			<Links label="Dashboard" to="/dashboard" />
		</div>
	);
};