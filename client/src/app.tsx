import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/Login-Page';
import { Provider } from './components/ui/provider';

/**
 * The main component that renders the application.
 * @returns The main component.
 */

function App() {
	return (
		<Provider>
			<BrowserRouter>
				<Routes>
					<Route path="/login" element={<LoginPage />} />
				</Routes>
			</BrowserRouter>
		</Provider>
	);
}

export default App;
