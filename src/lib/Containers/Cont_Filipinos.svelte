<!--
  File: src/routes/+page.svelte
  Description: This page now acts as a "configurator" for the reusable
  DeleteGenericTable component. All data-specific logic lives here.
-->
<script lang="ts">
  import { graphine } from '$lib/services/Svc_DB';
  import type { ColumnDef } from '@tanstack/table-core';

  // --- INTERFACE for our specific data ---
  interface FilipinoPerson {
    person_id: string;
    fullname: string;
    national_id: string;
    gender: string;
    birth_date: string;
    barrio_name: string;
    city_name: string | null;
    province_name: string | null;
    region_name: string;
  }

  // --- CONFIGURATION for the Filipino dataset ---

  // 1. Column Definitions
  const filipinoColumns: ColumnDef<FilipinoPerson>[] = [
    { accessorKey: 'region_name', header: 'Region', id: 'region_name' },
    { accessorKey: 'province_name', header: 'Province', id: 'province_name' },
    { accessorKey: 'city_name', header: 'City', id: 'city_name' },
    { accessorKey: 'barrio_name', header: 'Barrio', id: 'barrio_name' },
    { accessorKey: 'fullname', header: 'Full Name', id: 'fullname' },
    { accessorKey: 'national_id', header: 'National ID', id: 'national_id' },
    { accessorKey: 'gender', header: 'Gender', id: 'gender' },
    { accessorKey: 'birth_date', header: 'Birth Date', id: 'birth_date' },
  ];

  // 2. Search Options for the Dropdown
  const filipinoSearchOptions = [
    { value: 'fullname', label: 'Full Name' },
    { value: 'national_id', label: 'National ID' },
    { value: 'birth_year', label: 'Birth Year' },
    { value: 'barrio', label: 'Barrio' },
    { value: 'city', label: 'City' },
    { value: 'province', label: 'Province' },
    { value: 'region', label: 'Region' },
  ];

  // 3. Charting Hierarchy
  const filipinoDrillDownMap = new Map([
      ['region_name', { subGroupKey: 'province_name', title: 'Provinces' }],
      ['province_name', { subGroupKey: 'city_name', title: 'Cities' }],
      ['city_name', { subGroupKey: 'barrio_name', title: 'Barrios' }],
  ]);

  // 4. Data Fetching Logic
  async function handleFilipinoSearch(params: { searchInput: string, typeFilter: string }): Promise<FilipinoPerson[]> {
    const sp = {
      Subject: "FILIPINO✪F✪_filipinos",
      Predicate: {
        search: params.searchInput,
        type: params.typeFilter,
				limit: 1000
      }
    };
    const result = await graphine("/api/graphine", sp);
    if (Array.isArray(result)) {
        return result.map(person => ({
            ...person,
            fullname: person.fullname ? person.fullname.replace(/\|/g, ' ') : ''
        }));
    }
    return [];
  }
</script>

<DeleteGenericTable
    title="Filipinos Population Data"
    columns={filipinoColumns}
    searchOptions={filipinoSearchOptions}
    drillDownMap={filipinoDrillDownMap}
    rowIdKey="person_id"
    onSearch={handleFilipinoSearch}
/>

<!--
  TO USE FOR VEHICLES (Example):

  <script>
    // 1. Define vehicleColumns, vehicleSearchOptions, etc.
    // 2. Define a handleVehicleSearch function.
  </script>

  <DeleteGenericTable
    title="Vehicle Registry"
    columns={vehicleColumns}
    searchOptions={vehicleSearchOptions}
    rowIdKey="vehicle_id"
    onSearch={handleVehicleSearch}
    // No drillDownMap if vehicles have no hierarchy
  />
-->