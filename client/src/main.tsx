import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';

/**
 * The main entry point for the application.
 */

const root: HTMLElement = document.getElementById('root')!;
root.classList.add('dark:bg-slate-800');

ReactDOM.createRoot(root).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
