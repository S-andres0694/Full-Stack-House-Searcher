import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { RootState } from "../store";

/**
 * This slice is used to manage the theme of the application, which is either light or dark.
 * It also syncs the theme with the user's system.
 */

export const themeSlice: Slice = createSlice({
    name: 'theme',
    initialState: {
        theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light', //Default theme is dark if the user's system is in dark mode
    },
    reducers: {
        setTheme: (state: RootState) => {
            state.theme = state.theme === 'dark' ? 'light' : 'dark'; //Toggles the theme
        },
    },
});

/**
 * This function is used to toggle the theme of the application.
 * @returns The action to toggle the theme.
 */

export const { toggleTheme } = themeSlice.actions;


/**
 * This function is used to get the theme of the application.
 * @param state The state of the application.
 * @returns The theme of the application.
 */

export const getCurrentTheme = (state: RootState): string => state.theme.theme;

export default themeSlice.reducer;