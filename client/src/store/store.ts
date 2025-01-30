import { configureStore, Reducer, Store } from '@reduxjs/toolkit';
import { authenticationSlice } from './slices/authenticationSlice';
import {
	Persistor,
	persistStore,
	persistReducer,
	PersistConfig,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { animatedBackgroundSlice } from './slices/animatedBackgroundSlice';

/**
 * The persist config for the store.
 * @returns the persist config for the store.
 */

const persistConfig: PersistConfig<RootState> = {
	key: 'root',
	storage,
	debug: process.env.NODE_ENV === 'development',
};

/**
 * The persisted reducer for the authentication slice. Wraps over the authentication slice reducer to allow for persistence across reloads.
 * @returns the persisted reducer for the authentication slice.
 */

const persistedAuthenticationReducer: Reducer<RootState> = persistReducer(
	persistConfig,
	authenticationSlice.reducer,
);

/**
 * The persisted reducer for the animated background slice. Wraps over the animated background slice reducer to allow for persistence across reloads.
 * @returns the persisted reducer for the animated background slice.
 */

const persistedAnimatedBackgroundReducer: Reducer<RootState> = persistReducer(
	persistConfig,
	animatedBackgroundSlice.reducer,
);

/**
 * The store object. Contains all slices of the application.
 * @returns the store object.
 */

export const store: Store = configureStore({
	reducer: {
		authentication: persistedAuthenticationReducer,
		animatedBackground: persistedAnimatedBackgroundReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

export const persistor: Persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
