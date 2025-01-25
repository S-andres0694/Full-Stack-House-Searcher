import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider as ChakraProvider } from './components/ui/provider';
import { AccessPage } from './pages/Access-Page';
import { Home } from './pages/Home';
import { RootLayout } from './pages/RootLayout';
import { Provider } from 'react-redux';
import { persistor, store } from './store/store';
import { PersistGate } from 'redux-persist/integration/react';

/**
 * The main component that renders the application.
 * @returns The main component.
 */

function App() {
	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<ChakraProvider>
					<BrowserRouter>
						<Routes>
							<Route element={<RootLayout />}>
								<Route path="/" element={<Home />} />
								<Route path="/login" element={<AccessPage />} />
							</Route>
						</Routes>
					</BrowserRouter>
				</ChakraProvider>
			</PersistGate>
		</Provider>
	);
}

export default App;
