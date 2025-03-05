import React, { FunctionComponent } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { FaHouseChimneyMedical } from 'react-icons/fa6';

/**
 * Logo component that displays the logo of the application
 * @returns {React.ReactNode} a div with the logo of the application
 */

export const Logo: FunctionComponent = (): React.ReactNode => {
	return (
		<Box className="p-2">
			<Text fontSize="lg" fontWeight="bold" className="flex items-center gap-2">
				<FaHouseChimneyMedical
					size={24}
					className="bg-transparent text-slate-950 dark:text-white"
				/>
				<span className="bg-transparent text-slate-950 dark:text-white">
					HouseSearcher
				</span>
			</Text>
		</Box>
	);
};
