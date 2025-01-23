import { FunctionComponent } from "react";
import { Outlet } from "react-router-dom";
import { links, Navbar } from "../components/navbar/Navbar";
import { PatternBackground } from "../components/utilities/Pattern-Background";
import { ToastContainer } from "react-toastify";

/**
 * Root Layout shared across all routes.
 * @returns Root Layout component.
 */

export const RootLayout: FunctionComponent<{}> = (): JSX.Element => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar links={links} loginButton={true} />
            <PatternBackground>
                <div>
                    <ToastContainer className="bg-transparent" newestOnTop={true} />
                </div>
                <Outlet />
            </PatternBackground>
        </div>
    );
};