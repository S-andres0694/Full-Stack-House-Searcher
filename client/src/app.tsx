import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider as ChakraProvider } from './components/ui/provider';
import { AccessPage } from './pages/Access-Page';
import { Home } from './pages/Home';
import { RootLayout } from './pages/RootLayout';
/**
 * The main component that renders the application.
 * @returns The main component.
 */

function App() {
	return (
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
	);
}

export default App;
