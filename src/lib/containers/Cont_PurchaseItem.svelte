<script lang="ts">
  import { quintOut } from 'svelte/easing';
  import Cont_TableWizard from '$lib/containers/Cont_TableWizard.svelte';
  import Comp_Icons from '$lib/components/Comp_Icons.svelte';
  import { vehicleConfig } from '$lib/configs/Conf_Vehicles';
  import type { Purchase_Record as Vehicle } from '$lib/types';

  let selectedVehicle =  $state<Vehicle | null>(null);
  let paymentType = $state<'cash' | 'loan'>('cash');
  let selectedBranchId = $state<number | undefined>(undefined);
  let currentPrice = $state(0);

  $effect(() => {
   if (selectedVehicle) {
    currentPrice = selectedVehicle.purchase_value;
   }
  });

  function handlePriceInput(event: Event) {
   const span = event.target as HTMLSpanElement;
   const rawValue = span.innerText.replace(/[^0-9.]/g, '');
   const numberValue = rawValue === '' ? 0 : parseFloat(rawValue);
   if (!isNaN(numberValue)) {
    currentPrice = numberValue;
   }
  }

  $effect(() => {
   if (paymentType === 'cash') {
    selectedBranchId = undefined;
   }
  });

  const formatEditablePrice = (price: number) => {
   return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
   }).format(price);
  };

  function allowOnlyNumbers(event: KeyboardEvent) {
   if (
    ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(event.key)
   ) return;
   if (event.key === '.' && !(event.target as HTMLSpanElement).innerText.includes('.')) return;
   if (isNaN(parseInt(event.key, 10))) event.preventDefault();
  }

  function modalTransition(node: HTMLElement, { duration = 400 }) {
   return {
    duration,
    css: (t: number) => {
     const eased = quintOut(t);
     return `opacity: ${eased}; transform: scale(${0.95 + 0.05 * eased}) translateY(${
      (1 - eased) * 15
     }px);`;
    }
   };
  }

  // Function to generate the URL for the vehicle brand logo (from previous request)
  function getBrandLogoUrl(vehicle: Vehicle): string {
    const makeSlug = vehicle.make.replace(/ /g, '-');
    const modelSlug = vehicle.model.replace(/ /g, '-');
    return `/images/vehicles/${makeSlug}-${modelSlug}-${vehicle.year}.png`;
  }
</script>

<div class="relative h-full">
  <div class="h-full">
   <Cont_TableWizard
    title={vehicleConfig.title}
    columns={vehicleConfig.columns}
    searchOptions={vehicleConfig.searchOptions}
    rowIdKey={vehicleConfig.rowIdKey}
    endpoint={vehicleConfig.endpoint}
    ddlEndpointPrefix={vehicleConfig.ddlEndpointPrefix}
    bind:details={selectedVehicle}
   />
  </div>

  {#if selectedVehicle}
   <div
    class="absolute inset-0 z-20 bg-base-100 p-4 md:p-8 overflow-y-auto"
    transition:modalTransition
   >
    <div class="payment-section my-0 max-w-md mx-auto flex flex-col items-center text-center">
<!--     <h2 class="text-3xl font-bold mb-4">Finalize Purchase</h2>-->
     <div class="mb-2 text-md font-mono text-base-content/60">
      <!-- Vehicle Brand Logo Display removed as requested -->
      <p>VIN: {selectedVehicle.vin}</p>
      <p>{selectedVehicle.make} {selectedVehicle.model} {selectedVehicle.year}</p>
      <p>Dealership: {selectedVehicle.dealership}</p>
      <p>Original Price: ₱ {formatEditablePrice(selectedVehicle.value)}</p>
     </div>

     <!-- Purchase Price field adjusted to be narrower (max-w-xs) -->
     <div class="w-full max-w-xs mb-0">
      <div class="form-control items-center">
       <label class="label">
        <span class="label-text text-2xl text-zinc-700 font-semibold">Purchase Price</span>
       </label>
       <div
        class="flex items-center gap-x-3 w-full p-3 rounded-lg"
        class:bg-teal-200={paymentType === 'cash'}
        class:bg-rose-200={paymentType === 'loan'}
       >
        <span class="text-4xl font-sans font-semibold text-base-content/50">₱ </span>
        <span
         class="flex-grow text-left text-3xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary rounded px-2"
         class:text-teal-900={paymentType === 'cash'}
         class:text-rose-900={paymentType === 'loan'}
         contenteditable="true"
         oninput={handlePriceInput}
         onkeydown={allowOnlyNumbers}
         onblur={(e) =>
          ((e.target as HTMLSpanElement).innerText = formatEditablePrice(currentPrice))}
        >
         <!-- Initial value now directly from selectedVehicle.value -->
         {formatEditablePrice(selectedVehicle.value)}
        </span>
       </div>
      </div>
     </div>

     <div class="join my-0 shadow-sm">
      <button
       class="join-item btn btn-md w-28 normal-case"
       class:btn-active={paymentType === 'cash'}
       class:bg-teal-500={paymentType === 'cash'}
       class:text-white={paymentType === 'cash'}
       onclick={() => (paymentType = 'cash')}
      >
       <Comp_Icons name="cash" class="w-5 h-5 mr-2" />
       Cash
      </button>
      <button
       class="join-item btn btn-md w-28 normal-case"
       class:btn-active={paymentType === 'loan'}
       class:bg-rose-500={paymentType === 'loan'}
       class:text-white={paymentType === 'loan'}
       onclick={() => (paymentType = 'loan')}
      >
       <Comp_Icons name="loan" class="w-5 h-5 mr-2" />
       Loan
      </button>
     </div>

     <!-- Content for Cash Tab -->
     {#if paymentType === 'cash'}
      <div class="w-full max-w-sm mb-6 p-4 rounded-lg flex justify-center items-center bg-teal-100 shadow-inner">
        <img
          src="/img/cash.png"
          alt="Bundles of Cash Bills"
          class="rounded-lg max-w-full h-auto w-[400px]"
        />
      </div>
     {/if}

     <!-- Content for Loan Tab -->
     {#if paymentType === 'loan'}
      <div class="w-full max-w-sm mb-6 relative overflow-hidden rounded-lg shadow-lg">
        <!-- Loan Certificate Image (background) -->
        <img
          src="/img/loan.jpg"
          alt="Loan Certificate Background"
          class="absolute inset-0 w-full h-full object-cover z-0 rounded-lg"
        />
        <!-- Loan Details Overlay (Cont_Loans) -->
        <div class="relative z-10 p-4 bg-white bg-opacity-80 rounded-lg">
          <!-- IMPORTANT: Remove "Loan Details" label from Cont_Loans.svelte directly -->
          {#await import('$lib/containers/Cont_Loans.svelte') then { default: Cont_Loans }}
            <svelte:component this={Cont_Loans} bind:selectedBranchId />
          {:catch error}
            <div class="alert alert-error">
              <p>Error loading loan component: {error.message}</p>
            </div>
          {/await}
        </div>
      </div>
     {/if}

     <div class="w-full max-w-sm grid grid-cols-2 gap-4">
      <button
       class="btn btn-lg btn-neutral normal-case"
       onclick={() => (selectedVehicle = null)}
      >
       Cancel
      </button>
      <button
       class="btn btn-lg btn-primary normal-case"
       disabled={paymentType === 'loan' && !selectedBranchId}
      >
       Purchase
      </button>
     </div>
    </div>
   </div>
  {/if}
</div>

<style>
  .btn:disabled {
   background-color: #d1d5db;
   color: #9ca3af;
   border-color: #d1d5db;
  }
</style>
