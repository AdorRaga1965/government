
<script lang="ts">
	import { graphine } from '$lib/services/Svc_DB';
	import type { ColumnDef } from '$lib/Components/types';
	import Cont_TableWizard from '$lib/Containers/Cont_TableWizard.svelte';
	interface Vehicle {
		vin: string;
		make: string;
		model: string;
		year: number;
		value: number;
		country: string;
		source: string;
	}
	let { details = $bindable() } = $props<{ details: Vehicle | undefined }>();
	const vehicleColumns: ColumnDef<Vehicle>[] = [
		{ accessorKey: 'make', header: 'Make' },
		{ accessorKey: 'model', header: 'Model' },
		{ accessorKey: 'year', header: 'Year' },
		{ accessorKey: 'value', header: 'Value', isCurrency: true },
		{ accessorKey: 'source', header: 'Source' },
		{ accessorKey: 'country', header: 'Country' },
		{ accessorKey: 'vin', header: 'VIN' }
	];
	const vehicleSearchOptions = [
		{ value: 'vin', label: 'VIN' },
		{ value: 'make', label: 'Make', isDdl: true },
		{ value: 'model', label: 'Model', isDdl: true },
		{ value: 'year', label: 'Year', isDdl: true },
		{ value: 'source', label: 'Source', isDdl: true },
		{ value: 'country', label: 'Country', isDdl: true }
	];

	async function handleVehicleSearch(params: {
		searchInput: string;
		typeFilter: string;
	}): Promise<Vehicle[]> {
		const predicate = {
			e: 'vehicles.fn_inventory',
			l: 500,
			w: `'${params.typeFilter}' ,'${params.searchInput}'`
		};
		const result = await graphine('post', predicate);
		return Array.isArray(result) ? result : [];
	}
	async function handleDdl(typeFilter: string): Promise<{ type: string; count: number }[]> {
		const predicate = 'l=1000&e=vehicles.vw_' + typeFilter;
		const result = await graphine('get', predicate);
		return Array.isArray(result) ? result : [];
	}
</script>

<div class="h-full">
	<Cont_TableWizard
		title="Vehicle Registry Data"
		columns={vehicleColumns}
		searchOptions={vehicleSearchOptions}
		rowIdKey="vin"
		onSearch={handleVehicleSearch}
		onDdlSearch={handleDdl}
		bind:details={details}
	/>
</div>