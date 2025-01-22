import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider as ChakraProvider } from './components/ui/provider';
import { AccessPage } from './pages/Access-Page';
/**
 * The main component that renders the application.
 * @returns The main component.
 */

function App() {
	return (
			<ChakraProvider>
				<BrowserRouter>
					<Routes>
						<Route path="/login" element={<AccessPage />} />
					</Routes>
				</BrowserRouter>
			</ChakraProvider>
	);
}

export default App;
