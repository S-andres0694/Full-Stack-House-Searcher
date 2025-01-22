import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from './components/ui/provider';
import { AccessPage } from './pages/Access-Page';

/**
 * The main component that renders the application.
 * @returns The main component.
 */

function App() {
	return (
		<Provider>
			<BrowserRouter>
				<Routes>
					<Route path="/login" element={<AccessPage />} />
				</Routes>
			</BrowserRouter>
		</Provider>
	);
}

export default App;
