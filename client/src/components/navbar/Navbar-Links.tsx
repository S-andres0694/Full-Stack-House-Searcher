import { FunctionComponent } from "react";
import { Link } from "react-router-dom";

export const NavbarLinks: FunctionComponent = (): React.ReactNode => {
	return (
		<div>
			<Link to="/dashboard">Dashboard</Link>
		</div>
	);
};