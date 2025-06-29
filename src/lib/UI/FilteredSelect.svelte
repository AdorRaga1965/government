<script lang="ts">
    import type { LocationData } from "$lib/lib-meta/postgres"; // ✅ Import type definition

    interface Props {
        locationData?: LocationData[]; // ✅ Explicit array type
        selectedPlace?: LocationData; // ✅ Defined type structure
        minChars?: number; // ✅ Type safety for threshold
    }

    let { locationData = [], selectedPlace = $bindable({ Code: "", Location: "" }), minChars = 3 }: Props = $props();

    let filteredResults: LocationData[] = $state([]); // ✅ Strongly typed result list

    /* ✅ Filtering Logic */
    function filterResults(searchQuery: string): void {
        if (searchQuery.length < minChars) {
            filteredResults = []; // ✅ Hide dropdown if input is too short
            return;
        }

        filteredResults = locationData.filter((item: LocationData) =>
            item.Location.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    /* ✅ Handle Selection */
    function selectItem(item: LocationData): void {
        selectedPlace = item;
        filteredResults = []; // ✅ Close dropdown after selection
    }
</script>

<!-- ✅ Dropdown Overlay -->
<div class="dropdown-overlay absolute w-full max-w-md bg-white shadow-md rounded-md">
    {#if filteredResults.length > 0}
       <ul class="dropdown-list">
    {#each filteredResults as item (item.Code)}
        <button
            class="dropdown-item block w-full text-left p-2 hover:bg-blue-500 hover:text-white cursor-pointer"
            onclick={() => selectItem(item)}
        >
            {item.Location}
        </button>
    {/each}
				</ul>
    {/if}
</div>
