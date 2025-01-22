import { FunctionComponent } from 'react';
import { Alert } from '../ui/alert';
import { Slide, toast, Zoom } from 'react-toastify';

export interface PopupNotificationProps {
	errorMessage: string;
	errorTitle: string;
	type: 'error' | 'success' | 'info' | 'warning' | 'neutral';
	size?: 'sm' | 'md' | 'lg';
}

/**
 * A popup notification that displays an error message.
 * @param {string} errorTitle - The title of the error message
 * @param {string} errorMessage - The error message to display
 * @param {PopupPosition | PopupPosition[]} position - The position of the popup on the screen
 * @returns {FunctionComponent} - The popup notification
 */

export const PopupNotification: FunctionComponent<PopupNotificationProps> = ({
	errorTitle,
	errorMessage,
	type,
	size = 'lg',
}) => {
	return (
		<Alert
			size={size}
			title={errorTitle}
			status={type}
			className="shadow-lg rounded-lg"
		>
			{errorMessage}
		</Alert>
	);
};

/**
 * A function that displays a popup notification.
 * @param {string} errorTitle - The title of the error message
 * @param {string} errorMessage - The error message to display
 * @param {PopupPosition | PopupPosition[]} position - The position of the popup on the screen
 * @returns {FunctionComponent} - The popup notification
 */

export function notify(
	errorTitle: string,
	errorMessage: string,
	type: 'error' | 'success' | 'info' | 'warning' | 'neutral',
) {
	toast(
		<PopupNotification
			errorTitle={errorTitle}
			errorMessage={errorMessage}
			type={type}
		/>,
		{
			closeButton: false,
			position: 'top-right',
			closeOnClick: true,
			pauseOnHover: true,
			hideProgressBar: true,
			transition: Slide,
			className: 'bg-transparent shadow-none',
			autoClose: 2500,
		},
	);
}
