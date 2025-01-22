import { configureStore, Store } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";

export const store: Store = configureStore({
    reducer: {
        currentTheme: themeReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;