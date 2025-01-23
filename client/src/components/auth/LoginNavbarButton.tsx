import { FunctionComponent } from "react";
import { animated, useSpring } from "@react-spring/web";
import { Button } from "@chakra-ui/react";
import { AnimatedComponent } from "@react-spring/web";

/**
 * A button that, when clicked, will navigate to the login page.
 * @returns A button that, when clicked, will navigate to the login page.
 */

export const LoginNavbarButton: FunctionComponent<{
    onClick: () => void;
    text: string;
    type: 'submit' | 'button';
    disabled?: boolean;
}> = ({ onClick, text, type, disabled }) => {
    const [signInButtonHoverStyles, signInButtonHoverAnimations] = useSpring(
        () => ({
            from: {
                scale: 1,
            },
            config: {
                duration: 25,
                clamp: true,
            },
        }),
    );

    //This function is used to animate the sign in button when the user hovers over it
    const hoverAnimationsHandler = (): void => {
        signInButtonHoverAnimations.start({
            scale: 0.85,
        });
    };

    //This function is used to animate the sign in button when the user hovers out of it
    const hoverAnimationsLeaveHandler = (): void => {
        signInButtonHoverAnimations.start({
            scale: 1,
        });
    };

    //Modify the Button to use the hover animations
    const ButtonWithHoverAnimations: AnimatedComponent<typeof Button> =
        animated(Button);

    return (
        <ButtonWithHoverAnimations
            onMouseEnter={hoverAnimationsHandler}
            onMouseLeave={hoverAnimationsLeaveHandler}
            colorPalette="accent"
            onClick={onClick}
            className="dark:bg-slate-50 dark:text-black bg-slate-800 text-white py-2 px-4 text-sm"
            style={{
                ...signInButtonHoverStyles,
            }}
            variant="solid"
            type={type}
            rounded="full"
            disabled={disabled}
        >
            {text}
        </ButtonWithHoverAnimations>
    );
};
