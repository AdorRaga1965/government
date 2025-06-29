<script lang="ts">
  import { quintOut } from 'svelte/easing';
  import Cont_TableWizard from '$lib/Containers/Cont_TableWizard.svelte';
  import Comp_Icons from '$lib/Components/Comp_Icons.svelte';
  import { vehicleConfig } from '$lib/Configs/Conf_Vehicles';
  import type { Purchase_Record as Vehicle, User } from '$lib/types';
  import { graphine_notify } from '$lib/services/Svc_DB';

  // Props
  const { currentUser } = $props<{ currentUser: User }>();

  // State
  let selectedVehicle = $state<Vehicle | null>(null);
  let paymentType = $state<'cash' | 'loan'>('cash');
  let selectedBranchId = $state<number | undefined>(undefined);
  let currentPrice = $state(0);
  let isSaving = $state(false);
  let showSuccessToast = $state(false);

  // Effects for reactivity
  $effect(() => {
    if (selectedVehicle) {
      currentPrice = selectedVehicle.value;
    }
  });

  $effect(() => {
    if (paymentType === 'cash') {
      selectedBranchId = undefined;
    }
  });

  // Helper functions
  function handlePriceInput(event: Event) {
    const span = event.target as HTMLSpanElement;
    const rawValue = span.innerText.replace(/[^0-9.]/g, '');
    const numberValue = rawValue === '' ? 0 : parseFloat(rawValue);
    if (!isNaN(numberValue)) {
      currentPrice = numberValue;
    }
  }

  const formatEditablePrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  function allowOnlyNumbers(event: KeyboardEvent) {
    if ([
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'
    ].includes(event.key)) return;
    if (event.key === '.' && !(event.target as HTMLSpanElement).innerText.includes('.')) return;
    if (isNaN(parseInt(event.key, 10))) event.preventDefault();
  }

  function modalTransition(node: HTMLElement, { duration = 400 }) {
    return {
      duration,
      css: (t: number) => {
        const eased = quintOut(t);
        return `opacity: ${eased}; transform: scale(${0.95 + 0.05 * eased}) translateY(${(1 - eased) * 15}px);`;
      }
    };
  }

  // Core logic for purchase finalization
  async function finalizePurchase() {
    if (!selectedVehicle) return;
    if (paymentType === 'loan' && !selectedBranchId) return;

    const notes = `${selectedVehicle.make} ${selectedVehicle.model} ${selectedVehicle.year}|`;
    const source = selectedVehicle.dealership || selectedVehicle.source;

    const purchaseData = {
      vin: selectedVehicle.vin,
      owner_national_id: currentUser.officer_id,
      purchase_value: currentPrice,
      purchase_type: paymentType,
      source: source,
      notes: notes,
      dt_purchase: new Date().toISOString()
    };

    const dbArg = { ...purchaseData, plate_id: selectedVehicle.plate_id || '' };
    const notifyPayload = { ...purchaseData, action: 'purchase' };

    isSaving = true;
    try {
      await graphine_notify({
        e: 'vehicles.fn_newpurchase',
        w: [JSON.stringify(dbArg)],
        notify: {
          method: 'notifyRoles',
          payload: notifyPayload,
          roles: ['notary'],
          tag: 'purchase'
        }
      });
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000); // Display toast for 3 seconds
      selectedVehicle = null; // Reset selected vehicle to close overlay
    } catch (err) {
      // Error handling is managed by Svc_DB which dispatches 'apirequest:end'
      // No need for console.error here based on the refactor request.
    } finally {
      isSaving = false;
    }
  }

  // Reactive classes for payment type buttons using $derived
  const cashButtonClasses = $derived(`join-item btn btn-md w-28 normal-case ${paymentType === 'cash' ? 'btn-active bg-teal-500 text-white' : ''}`);
  const loanButtonClasses = $derived(`join-item btn btn-md w-28 normal-case ${paymentType === 'loan' ? 'btn-active bg-rose-500 text-white' : ''}`);

  // Reactive classes for price input background and text color using $derived
  const priceInputBgClass = $derived(paymentType === 'cash' ? 'bg-teal-200' : 'bg-rose-200');
  const priceInputTextColorClass = $derived(paymentType === 'cash' ? 'text-teal-900' : 'text-rose-900');
</script>

{#if showSuccessToast}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-green-500 text-white p-6 rounded-xl shadow-xl animate-bounce-in-out text-center">
      <h2 class="text-2xl font-bold mb-2">✅ Purchase Recorded</h2>
      <p class="text-md">New Purchase saved and Notary Service notified successfully.</p>
    </div>
  </div>
{/if}

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
        <div class="mb-2 text-md font-mono text-base-content/60">
          <p>VIN: {selectedVehicle.vin}</p>
          <p>{selectedVehicle.make} {selectedVehicle.model} {selectedVehicle.year}</p>
          <p>Source: {selectedVehicle.dealership}</p>
          <p>Original Price: ₱ {formatEditablePrice(selectedVehicle.value)}</p>
        </div>

        <div class="w-full max-w-xs mb-0">
          <div class="form-control items-center">
            <label class="label">
              <span class="label-text text-2xl text-zinc-700 font-semibold">Purchase Price</span>
            </label>
            <div
              class={`flex items-center gap-x-3 w-full p-3 rounded-lg ${priceInputBgClass}`}
            >
              <span class="text-4xl font-sans font-semibold text-base-content/50">₱ </span>
              <span
                class={`flex-grow text-left text-3xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 ${priceInputTextColorClass}`}
                contenteditable="true"
                on:input={handlePriceInput}
                on:keydown={allowOnlyNumbers}
                on:blur={(e) => ((e.target as HTMLSpanElement).innerText = formatEditablePrice(currentPrice))}
              >
                {formatEditablePrice(currentPrice)}
              </span>
            </div>
          </div>
        </div>

        <div class="join my-0 shadow-sm">
          <button
            class={cashButtonClasses}
            on:click={() => (paymentType = 'cash')}
          >
            <Comp_Icons name="cash" class="w-5 h-5 mr-2" />
            Cash
          </button>
          <button
            class={loanButtonClasses}
            on:click={() => (paymentType = 'loan')}
          >
            <Comp_Icons name="loan" class="w-5 h-5 mr-2" />
            Loan
          </button>
        </div>

        {#if paymentType === 'cash'}
          <div class="w-full max-w-sm mb-6 p-4 rounded-lg flex justify-center items-center bg-teal-100 shadow-inner">
            <img
              src="/img/cash.png"
              alt="Bundles of Cash Bills"
              class="rounded-lg max-w-full h-auto w-[400px]"
            />
          </div>
        {/if}

        {#if paymentType === 'loan'}
          <div class="w-full max-w-sm mb-6 relative overflow-hidden rounded-lg shadow-lg">
            <img
              src="/img/loan.jpg"
              alt="Loan Certificate Background"
              class="absolute inset-0 w-full h-full object-cover z-0 rounded-lg"
            />
            <div class="relative z-10 p-4 bg-white bg-opacity-80 rounded-lg">
              {#await import('$lib/Containers/Cont_Loans.svelte') then { default: Cont_Loans }}
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
            on:click={() => (selectedVehicle = null)}
          >
            Cancel
          </button>
          <button
            class="btn btn-lg btn-primary normal-case"
            disabled={(paymentType === 'loan' && !selectedBranchId) || isSaving}
            on:click={finalizePurchase}
          >
            {#if isSaving}
              <span class="loading loading-spinner"></span>
            {:else}
              Purchase
            {/if}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Custom style for disabled button, if not fully covered by DaisyUI defaults */
  .btn:disabled {
    background-color: #d1d5db;
    color: #9ca3af;
    border-color: #d1d5db;
  }
</style>
