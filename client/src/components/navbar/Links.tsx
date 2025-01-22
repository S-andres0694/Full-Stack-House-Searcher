import { useSpring } from "@react-spring/web";
import { FunctionComponent, MouseEventHandler } from "react";
import { Link } from "react-router-dom";
import { useColorMode } from "../ui/color-mode";
import { animated } from "@react-spring/web";
import { AnimatedComponent } from "@react-spring/web";
import { easings } from "@react-spring/web";
import TypewriterAnimatedHeader from "../text/TypewriterHeaders";
interface LinksProps {
	label: string;
    to: string;
    icon?: React.ReactNode;
}
/**
 * Links component
 * @param {LinksProps} props - The props for the Links component
 * @returns {React.ReactNode} a link
 */

export const Links: FunctionComponent<LinksProps> = ({ label, to, icon }: LinksProps): React.ReactNode => {
    //This is used to get the current theme
    const { colorMode }: { colorMode: string } = useColorMode();

    //This is used to animate the link
    const [ linkState, linkStateAnimations ] = useSpring(() => ({
        from: {
            background: 'transparent',
            transform: 'translateY(0)',
            scale: 1,
        },
        config: {
            duration: 20,
            easing: easings.easeInOutQuad,
        }   
    })); 

    //This is used to animate the link when the user hovers over it
    const hoverAnimationsHandler: MouseEventHandler<HTMLAnchorElement> = (): void => {
        linkStateAnimations.start({
            background: colorMode === 'dark' ? '#FAFAFA' : '#1E293C',
            transform: 'translateY(-2.5px)',
            scale: 1.08,
        });
    };

    //This is used to animate the link when the user hovers out of it
    const hoverAnimationsLeaveHandler: MouseEventHandler<HTMLAnchorElement> = (): void => {
        linkStateAnimations.start({
            background: 'transparent',
            transform: 'translateY(0)',
            scale: 1,
        });
    };

    //This is used to animate the link
    const AnimatedLink: AnimatedComponent<typeof Link> = animated(Link);

	return (
		<AnimatedLink style={linkState} className="p-2 px-4 rounded-full dark:hover:text-slate-800 hover:text-white hover:shadow-slate-800 dark:hover:shadow-white hover:shadow-2xl" to={to} onMouseEnter={hoverAnimationsHandler} onMouseLeave={hoverAnimationsLeaveHandler}> {icon} <TypewriterAnimatedHeader text={label} delayPerLetter={15} /></AnimatedLink>
	);
};