import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';

/**
 * The main entry point for the application.
 */

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
