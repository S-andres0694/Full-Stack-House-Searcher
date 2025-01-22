import { useSpring } from "@react-spring/web";
import { FunctionComponent, useState } from "react";
import { Link } from "react-router-dom";
import { useColorModeValue } from "../ui/color-mode";
import { animated } from "@react-spring/web";
import { AnimatedComponent } from "@react-spring/web";
import { easings } from "@react-spring/web";
interface LinksProps {
	label: string;
	to: string;
}
/**
 * Links component
 * @param {LinksProps} props - The props for the Links component
 * @returns {React.ReactNode} a link
 */

export const Links: FunctionComponent<LinksProps> = ({ label, to }: LinksProps): React.ReactNode => {
    //This is used to get the current theme
    const currentTheme: string = useColorModeValue('light', 'dark');

    //This is used to animate the link
    const [ linkState, linkStateAnimations ] = useSpring(() => ({
        from: {
            backgroundColor: 'transparent',
            transform: 'translateY(0)',
            color: currentTheme === 'dark' ? '#e5e7eb' : '#1f2937',
            scale: 1,
        },
        config: {
            duration: 50,
            easing: easings.easeInOutCubic,
            friction: 10,
            precision: 0.0001,
            clamp: true,
        }   
    })); 

    //This is used to animate the link when the user hovers over it
    const hoverAnimationsHandler = (): void => {
        linkStateAnimations.start({
            backgroundColor: currentTheme === 'dark' ? '#e5e7eb' : '#1f2937',
            transform: 'translateY(-5px)',
            color: currentTheme === 'dark' ? '#1f2937' : '#e5e7eb',
            scale: 1.05,
        });
    };

    //This is used to animate the link when the user hovers out of it
    const hoverAnimationsLeaveHandler = (): void => {
        linkStateAnimations.start({
            backgroundColor: 'transparent',
            transform: 'translateY(0)',
            color: currentTheme === 'dark' ? '#e5e7eb' : '#1f2937',
            scale: 1,
        });
    };

    //This is used to animate the link
    const AnimatedLink: AnimatedComponent<typeof Link> = animated(Link);

	return (
		<AnimatedLink style={linkState} className="p-2 px-4 rounded-full" to={to} onMouseEnter={hoverAnimationsHandler} onMouseLeave={hoverAnimationsLeaveHandler}>{label}</AnimatedLink>
	);
};