<script lang="ts" generics="T extends Record<string, any>">
  import { onMount } from 'svelte';
  import { graphine } from '$lib/services/Svc_DB';

  type ColumnDef<T> = {
    header: string;
    accessorKey: keyof T & string;
    accessorFn?: (row: T) => any;
    isCurrency?: boolean;
  };

  let {
    title,
    columns,
    searchOptions,
    rowIdKey,
    endpoint,
    ddlEndpointPrefix,
    details = $bindable()
  } = $props<{
    title: string;
    columns: ColumnDef<T>[];
    searchOptions: { value: string; label: string; isDdl?: boolean }[];
    rowIdKey: keyof T & string;
    endpoint: string;
    ddlEndpointPrefix: string;
    details: T | undefined;
  }>();

  onMount(() => {
    details = undefined;
  });

  const ddlCache = new Map<string, any[]>();
  let clickedRowId = $state<string | number | null>(null); // CORRECTED: This line was causing the break
  let mainInputEl: HTMLInputElement;
  let dependentSelectEl: HTMLSelectElement;
  let data = $state<T[]>([]);
  let sorting = $state<{ id: string; desc: boolean }[]>([]);
  let pagination = $state({ pageIndex: 0, pageSize: 20 });
  let globalFilter = $state('');
  let searchInput = $state('');
  let typeFilter = $state('');
  let isLoading = $state(false);
  let hasSearched = $state(false);
  let dependentDropdownOptions = $state<any[]>([]);
  let dependentSearchValue = $state('');
  let isDdlLoading = $state(false);

  // New state for search button logic
  let searchPerformed = $state(false);
  let lastAppliedDependentSearchValue = $state('');

  function formatDdlData(items: any[]): { type: string; count: number }[] {
    return items.map((item) => {
      const key = Object.keys(item).find((k) => k !== 'count');
      return { type: item[key as keyof typeof item], count: item.count };
    });
  }

  async function handleCategoryChange() {
    const selectedOption = searchOptions.find((opt) => opt.value === typeFilter);
    const isDdl = selectedOption?.isDdl ?? false;
    dependentSearchValue = '';
    dependentDropdownOptions = [];

    // Reset searchPerformed when category changes (enables search for a new category)
    searchPerformed = false;

    if (isDdl) {
      if (ddlCache.has(typeFilter)) {
        dependentDropdownOptions = ddlCache.get(typeFilter) || [];
        setTimeout(() => dependentSelectEl?.focus(), 50);
        return;
      }
      isDdlLoading = true;
      try {
        const ddlData = await handleDdl(typeFilter);
        const formattedData = formatDdlData(ddlData);
        dependentDropdownOptions = formattedData;
        ddlCache.set(typeFilter, formattedData);
      } catch (e) {
        console.error('Failed to load DDL options', e);
      } finally {
        isDdlLoading = false;
        setTimeout(() => dependentSelectEl?.focus(), 50);
      }
    } else {
      mainInputEl?.focus();
    }
  }

  // Reactively re-enable search button if dependent value changes (after search)
  $effect(() => {
    if (searchConfig.isDependent && searchPerformed && dependentSearchValue !== lastAppliedDependentSearchValue) {
      searchPerformed = false;
    }
  });


  function handleDdl(typeFilter: string): Promise<{ type: string; count: number }[]> {
    const predicate = 'l=1000&e=' + ddlEndpointPrefix + typeFilter;
    return graphine('get', predicate);
  }

  function handleSearch(params: { searchInput: string; typeFilter: string }): Promise<T[]> {
    const predicate = {
      e: endpoint,
      l: 1000,
      w: `'${params.typeFilter}' ,'${params.searchInput}'`
    };
    return graphine('post', predicate);
  }

  const formatCurrency = (value: any) => {
    const num = Number(value);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  function renderCell(row: T, column: ColumnDef<T>) {
    const cellValue = column.accessorFn ? column.accessorFn(row) : row[column.accessorKey];
    return column.isCurrency ? formatCurrency(cellValue) : cellValue;
  }

  const searchConfig = $derived.by(() => {
    const selectedOption = searchOptions.find((opt) => opt.value === typeFilter);
    return {
      isDependent: selectedOption?.isDdl ?? false,
      label: selectedOption?.label ?? 'Value',
      isSearchDisabled: !typeFilter || ((selectedOption?.isDdl ?? false) ? !dependentSearchValue : !searchInput)
    };
  });

  const processedData = $derived.by(() => {
    let processed = [...data];
    if (globalFilter) {
      const filterLower = globalFilter.toLowerCase();
      processed = processed.filter((row) =>
        Object.values(row).some((val) => String(val).toLowerCase().includes(filterLower))
      );
    }
    if (sorting.length > 0) {
      const sort = sorting[0];
      processed.sort((a, b) => {
        const valA = a[sort.id];
        const valB = b[sort.id];
        if (valA < valB) return sort.desc ? 1 : -1;
        if (valA > valB) return sort.desc ? -1 : 1;
        return 0;
      });
    }
    return processed;
  });

  const pageCount = $derived(Math.ceil(processedData.length / pagination.pageSize) || 1);
  const paginatedRows = $derived(
    processedData.slice(
      pagination.pageIndex * pagination.pageSize,
      (pagination.pageIndex + 1) * pagination.pageSize
    )
  );

  function handleSort(columnId: string) {
    const existingSort = sorting.find((s) => s.id === columnId);
    if (existingSort) {
      if (existingSort.desc) {
        sorting = [];
      } else {
        sorting = [{ id: columnId, desc: true }];
      }
    } else {
      sorting = [{ id: columnId, desc: false }];
    }
  }

  function getSortDirection(columnId: string) {
    const sort = sorting.find((s) => s.id === columnId);
    if (!sort) return '';
    return sort.desc ? '🔽' : '🔼';
  }

  function selectRow(row: T) {
    clickedRowId = row[rowIdKey];
    details = row;
  }

  async function applyFiltersAndSearch() {
    hasSearched = true;
    const finalSearchInput = searchConfig.isDependent ? dependentSearchValue : searchInput;
    if (!finalSearchInput || !typeFilter) {
      data = [];
      return;
    }
    isLoading = true;
    globalFilter = '';
    try {
      data = await handleSearch({ searchInput: finalSearchInput, typeFilter });
      pagination.pageIndex = 0;
      // Capture the value used for this search if it was a dependent search
      if (searchConfig.isDependent) {
        lastAppliedDependentSearchValue = dependentSearchValue;
      } else {
        // Clear it if not dependent to avoid confusion
        lastAppliedDependentSearchValue = '';
      }
      searchPerformed = true; // Mark search as performed
    } catch (error) {
      data = [];
      console.error('Data fetching failed:', error);
    } finally {
      isLoading = false;
    }
  }

  function resetFilters() {
    searchInput = '';
    typeFilter = '';
    dependentSearchValue = '';
    globalFilter = '';
    data = [];
    sorting = [];
    hasSearched = false;
    searchPerformed = false; // Reset search state
    lastAppliedDependentSearchValue = ''; // Clear last applied value
  }

  const getPaginationButtons = $derived(() => {
    const currentPage = pagination.pageIndex;
    const totalPages = pageCount;
    const pageRange: (string | number)[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) {
        pageRange.push(i);
      }
    } else {
      pageRange.push(0);
      if (currentPage > 2) {
        pageRange.push('...');
      }
      for (
        let i = Math.max(1, currentPage - 1);
        i <= Math.min(totalPages - 2, currentPage + 1);
        i++
      ) {
        pageRange.push(i);
      }
      if (currentPage < totalPages - 3) {
        pageRange.push('...');
      }
      pageRange.push(totalPages - 1);
    }
    return pageRange;
  });
</script>

<div class="w-full mx-auto p-1 sm:p-3 h-full flex flex-col bg-base-100 rounded-lg shadow-xl overflow-hidden">
  <header class="flex-shrink-0 pt-2 px-2">
    <div class="px-3 py-2 rounded-lg shadow-md border bg-indigo-100">
      <h1 class="text-2xl font-bold shady mb-1 text-center">{title}</h1>
      <div class="grid grid-cols-1 md:grid-cols-12 gap-x-2 items-end">
        <div class="md:col-span-3">
          <select
            id="typeFilter"
            bind:value={typeFilter}
            onchange={handleCategoryChange}
            class="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm h-9"
          >
            <option value="" disabled>Select a column</option>
            {#each searchOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>
        <div class="md:col-span-5">
          {#if searchConfig.isDependent}
            <select
              bind:this={dependentSelectEl}
              id="dependentSearchInput"
              bind:value={dependentSearchValue}
              class="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm h-9"
              disabled={!typeFilter || isDdlLoading}
            >
              <option value="" disabled>
                {#if !typeFilter}
                  ← Select category first
                {:else if isDdlLoading}
                  Loading...
                {:else}
                  Select a {searchConfig.label}
                {/if}
              </option>
              {#each dependentDropdownOptions as option}
                <option value={option.type.split('(')[0].trim()}>{option.type.replace("Available", "Fresh")}</option>
              {/each}
            </select>
          {:else}
            <input
              bind:this={mainInputEl}
              id="serverSearchInput"
              type="text"
              bind:value={searchInput}
              placeholder="Enter search term..."
              class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm h-9"
              disabled={!typeFilter}
            />
          {/if}
        </div>
        <div class="flex mt-2 p2 gap-2">
          <button
            onclick={applyFiltersAndSearch}
            disabled={searchConfig.isSearchDisabled || isLoading || isDdlLoading || (searchPerformed && searchConfig.isDependent && dependentSearchValue === lastAppliedDependentSearchValue)}
            class="w-full bg-green-400 text-black font-semibold rounded-md shadow-sm transition duration-300 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >Search</button
          >
          <button
            onclick={resetFilters}
            class="w-full bg-red-400 text-black font-semibold rounded-md shadow-sm transition duration-300 ease-in-out cursor-pointer"
          >Reset</button
          >
        </div>
      </div>
    </div>
  </header>

  <main class="flex-grow min-h-0 overflow-auto mt-2 px-2">
    {#if !hasSearched}
      <div class="flex-grow flex items-center justify-center text-gray-500">
        <p>Please select a filter and search to begin.</p>
      </div>
    {:else if data.length === 0 && !isLoading}
      <div class="flex-grow flex items-center justify-center text-gray-500">
        <p>No records found for your query.</p>
      </div>
    {:else}
      <table class="min-w-full bg-white border-collapse">
        <thead class="bg-gray-100 sticky top-0 z-10">
          <tr class="border-b-2 border-gray-300">
            {#each columns as column}
              <th
                scope="col"
                class="px-1.5 py-2 text-left text-xs font-bold bg-indigo-200 text-zinc-600 select-none"
              >
                <button
                  type="button"
                  onclick={() => handleSort(column.accessorKey)}
                  class="flex items-center w-full text-left cursor-pointer"
                >
                  {column.header}
                  <span class="ml-2">{getSortDirection(column.accessorKey)}</span>
                </button>
              </th>
            {/each}
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          {#each paginatedRows as row (row[rowIdKey])}
            <tr
              class="hover:bg-amber-100"
              class:animate-flash={clickedRowId === row[rowIdKey]}
            >
              {#each columns as column}
                <td
                  class="px-1.5 py-1.5 text-xs cursor-pointer text-zinc-700 hover:font-extrabold"
                  class:text-right={column.isCurrency}
                  onclick={() => selectRow(row)}
                >
                  {@html renderCell(row, column)}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </main>
  {#if hasSearched && data.length > 0}
    <footer
      class="flex-shrink-0 flex items-center justify-between mt-2 py-1 flex-wrap gap-2 text-xs text-gray-700 bg-gray-100 rounded-lg border px-2 shadow-inner"
    >
      <div class="flex items-center gap-2">
        <span>Rows/page:</span>
        <select
          bind:value={pagination.pageSize}
          class="p-1 w-16 border border-gray-300 rounded-md text-xs cursor-pointer"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
      <div class="flex items-center">
        <div class="relative">
          <label for="clientSearch" class="sr-only">Filter results</label>
          <input
            id="clientSearch"
            type="text"
            bind:value={globalFilter}
            placeholder="Filter results..."
            class="p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm w-full max-w-xs h-8"
          />
          {#if globalFilter}
            <button
              onclick={() => (globalFilter = '')}
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >×</button
            >
          {/if}
        </div>
      </div>
      <div>
        <span>Page <strong>{pagination.pageIndex + 1} of {pageCount}</strong></span>
        <span class="mx-1">|</span>
        <span>Go to:</span>
        <input
          type="number"
          value={pagination.pageIndex + 1}
          onchange={(e) => {
            const page = e.currentTarget.valueAsNumber - 1;
            if (page >= 0 && page < pageCount) pagination.pageIndex = page;
          }}
          class="border p-1 rounded w-12 ml-1 text-xs"
        />
      </div>
      <div class="flex items-center gap-1">
        <button
          onclick={() => (pagination.pageIndex = 0)}
          disabled={pagination.pageIndex === 0}
          class="px-1.5 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">«</button
        >
        <button
          onclick={() => pagination.pageIndex--}
          disabled={pagination.pageIndex === 0}
          class="px-1.5 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">‹</button
        >
        {#each getPaginationButtons as page}
          {#if typeof page === 'string'}
            <span class="px-2 py-1">...</span>
          {:else}
            <button
              onclick={() => (pagination.pageIndex = page)}
              disabled={page === pagination.pageIndex}
              class="px-2 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed {page ===
              pagination.pageIndex
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white'} cursor-pointer"
            >{page + 1}</button
            >
          {/if}
        {/each}
        <button
          onclick={() => (pagination.pageIndex++)}
          disabled={pagination.pageIndex >= pageCount - 1}
          class="px-1.5 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">›</button
        >
        <button
          onclick={() => (pagination.pageIndex = pageCount - 1)}
          disabled={pagination.pageIndex >= pageCount - 1}
          class="px-1.5 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">»</button
        >
      </div>
    </footer>
  {/if}
</div>
<style>
  @keyframes pulse-focus-anim {
    0% {
      box-shadow: 0 0 0 0px var(--color-pulse);
    }
    100% {
      box-shadow: 0 0 0 6px transparent;
    }
  }
  .animate-pulse-focus {
    animation: pulse-focus-anim 0.7s ease-out;
  }
  @keyframes flash-anim {
    0% {
      background-color: var(--color-flash);
    }
    100% {
      background-color: transparent;
    }
  }
</style>