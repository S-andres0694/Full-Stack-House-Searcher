// tailwind.config.js
/** @type {import('tailwindcss').Config} */

import heroPatterns from 'tailwindcss-hero-patterns';
export const content = ['./src/**/*.{js,jsx,ts,tsx}'];
export const theme = {
	extend: {},
};
export const plugins = [heroPatterns];
export const important = true;
export const darkMode = 'class';
