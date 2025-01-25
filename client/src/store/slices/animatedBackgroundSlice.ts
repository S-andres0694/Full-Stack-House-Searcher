import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';

/**
 * The state of the animated background.
 */

interface AnimatedBackgroundState {
	animatedBackground: boolean;
}

/**
 * The slice for the animated background. Determines if the animated background is enabled.
 * @returns the slice for the animated background.
 */

export const animatedBackgroundSlice: Slice<AnimatedBackgroundState> =
	createSlice({
		name: 'animatedBackground',
		initialState: {
			animatedBackground: false,
		} as AnimatedBackgroundState,
		reducers: {
			setAnimatedBackground: (
				state: AnimatedBackgroundState,
				action: PayloadAction<boolean>,
			) => {
				state.animatedBackground = action.payload;
			},
		},
	});

/**
 * The actions for the animated background slice.
 */

export const { setAnimatedBackground } = animatedBackgroundSlice.actions;
