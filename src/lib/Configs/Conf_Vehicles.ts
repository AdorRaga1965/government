import type { ColumnDef } from '$lib/Components/types';
import type { Vehicle } from '$lib/types'; // Assuming Vehicle type is defined in your main types.ts

// The configuration is exported as a single object for easy import.
export const vehicleConfig = {
	title: 'Vehicle Registry Data',
	columns: [
		{ accessorKey: 'make', header: 'Make' },
		{ accessorKey: 'model', header: 'Model' },
		{ accessorKey: 'year', header: 'Year' },
		{ accessorKey: 'value', header: 'Value', isCurrency: true },
		{ accessorKey: 'dealership', header: 'Dealership' },
		{ accessorKey: 'country', header: 'Country' },
		{ accessorKey: 'vin', header: 'VIN' }
	] as ColumnDef<Vehicle>[],
	searchOptions: [
		{ value: 'vin', label: 'VIN' },
		{ value: 'make', label: 'Make', isDdl: true },
		{ value: 'model', label: 'Model', isDdl: true },
		{ value: 'year', label: 'Year', isDdl: true },
		{ value: 'dealership', label: 'Dealership', isDdl: true },
		{ value: 'country', label: 'Country', isDdl: true }
	],
	rowIdKey: 'vin',
	endpoint: 'vehicles.fn_inventory',
	ddlEndpointPrefix: 'vehicles.vw_'
};