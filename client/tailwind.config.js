// tailwind.config.js
/** @type {import('tailwindcss').Config} */

import heroPatterns from 'tailwindcss-hero-patterns';
export const content = ['./src/**/*.{js,jsx,ts,tsx}'];
export const theme = {
	extend: {
		fontFamily: {
			'ibm-plex-sans': ['IBM Plex Sans', 'system-ui'],
		},
	},
};
export const plugins = [heroPatterns];
export const important = true;
export const darkMode = 'class';