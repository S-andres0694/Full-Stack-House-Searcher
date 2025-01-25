import { configureStore, Reducer, Store } from '@reduxjs/toolkit';
import { authenticationSlice } from './slices/authenticationSlice';
import {
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

/**
 * The persist config for the store.
 * @returns the persist config for the store.
 */

const persistConfig: PersistConfig<RootState> = {
	key: 'root',
	storage,
	debug: true,
};

/**
 * The persisted reducer for the authentication slice. Wraps over the authentication slice reducer to allow for persistence across reloads.
 * @returns the persisted reducer for the authentication slice.
 */

const persistedReducer: Reducer<RootState> = persistReducer(
	persistConfig,
	authenticationSlice.reducer,
);

/**
 * The store object. Contains all slices of the application.
 * @returns the store object.
 */

export const store: Store = configureStore({
	reducer: {
		authentication: persistedReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
