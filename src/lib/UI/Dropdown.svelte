<script lang="ts">
    import { run } from 'svelte/legacy';
      import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
    interface Props {
        showDropdown?: boolean;
        records?: Array<string>; // ✅ Explicit array type
        selectedValue?: string;
    }

    let { showDropdown = $bindable(false), records = [], selectedValue = $bindable("") }: Props = $props();
// export let onSelect;
run(() => {selectedValue;});
// $: selectedPlace;
run(() => { showDropdown; });


function onSelect(item: any) {
    selectedValue = `${item.code},${item.parentcode}|${item.place}`;
    const value = selectedValue.split('|')[0].split(',');
    console.log('Selected Value (updated state):', value[0] + "," + value[1] );
    dispatch('select', selectedValue);
}


</script>
<div class="dropdown-overlay absolute w-full max-w-md bg-white shadow-md rounded-md {records?.length ? '' : 'hidden'}">
    <ul class="dropdown-list">
        {#each records as item}
            <li
                class="dropdown-item block w-full text-left px-1 py-0 hover:text-white cursor-pointer
                       {item.place.includes(',,') ? 'hidden' : ''}"
                onclick={() => onSelect(item)}>
                {item.place.replace(", PHILIPPINES", "")}
            </li>
        {/each}
    </ul>
</div>


<style>
          .dropdown-overlay {
            background: linear-gradient(135deg, #1e3a8a, #3b82f6, #60a5fa, #93c5fd); /* ✅ Midnight gradient */
            color: white; /* ✅ Ensures text remains readable */
            border-radius: 8px; /* ✅ Smooth edges */
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3); /* ✅ Adds depth */
            transition: all 0.2s ease-in-out; /* ✅ Smooth appearance */
        }

        .dropdown-list {
            padding: 8px;
        }

        .dropdown-item {
            padding: 5px;
            margin: 2px 0;
            color: yellow;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.1); /* ✅ Soft transparency */
            transition: background 0.5s ease-in-out;
        }

        .dropdown-item:hover {
            background: rgba(20, 255, 220, 0.3); /* ✅ Hover glow effect */
            color: antiquewhite;
        }

</style>