import type { ColumnDef } from '$lib/Components/types';
import type { FilipinoPerson } from '$lib/types';

// The configuration is exported as a single object for easy import.
export const filipinoConfig = {
	title: 'Search Population',
	columns: [
		{ accessorKey: 'fullname', header: 'Full Name' },
		{ accessorKey: 'national_id', header: 'National ID' },
		{ accessorKey: 'gender', header: 'Gender' },
		{ accessorKey: 'birth_date', header: 'Birth Date' },
		{ accessorKey: 'barrio_name', header: 'Barrio' }
	] as ColumnDef<FilipinoPerson>[],
	searchOptions: [
		{ value: 'fullname', label: 'Full Name' },
		{ value: 'national_id', label: 'National ID' },
		{ value: 'birth_year', label: 'Birth Year' },
		{ value: 'region', label: 'Region', isDdl: true },
		{ value: 'province', label: 'Province', isDdl: true },
		{ value: 'city', label: 'City', isDdl: true }
	],
	rowIdKey: 'person_id',
	endpoint: 'filipino.population',
	ddlEndpointPrefix: 'filipino.vw_'
};