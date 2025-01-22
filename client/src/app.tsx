import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AccessPage } from './pages/Access-Page';

/**
 * The main component that renders the application.
 * @returns The main component.
 */

function App() {
	return (
		<Provider store={store}>
			<BrowserRouter>
				<Routes>
					<Route path="/login" element={<AccessPage />} />
				</Routes>
			</BrowserRouter>
		</Provider>
	);
}

export default App;
