import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';

interface AuthenticationState {
	userIsAuthenticated: boolean;
}

/**
 * Slice: It manages a much more specific state of the application, which in this case is the auth state.
 * It allows you to break down the state into smaller pieces, which makes it easier to manage.
 * A slice is composed by three main parts:
 * - name: the name of the slice.
 * - initialState: the initial state of the slice.
 * - reducers: the reducers of the slice. Reducers are functions that modify the state in response to an action.
 * @returns the authentication slice of the store.
 */

export const authenticationSlice: Slice = createSlice({
	name: 'authentication',
	initialState: {
		userIsAuthenticated: false,
	} as AuthenticationState,
	reducers: {
		setUsersAuthenticationState: (state, action: PayloadAction<boolean>) => {
			state.userIsAuthenticated = action.payload;
		},
	},
});
