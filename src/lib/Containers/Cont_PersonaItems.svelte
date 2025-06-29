<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Comp_InfoModal from '$lib/Components/Comp_InfoModal.svelte';
  import Comp_PersonaItemDetails from '$lib/Components/Comp_PersonaItemDetails.svelte';
  import type { Purchase_Record } from '$lib/types';
  import { loadPendingPersonaItems, graphine_notify } from '$lib/services/Svc_DB';

  export let persona: string;

  let tasks: Purchase_Record[] = [];
  let selectedTask: Purchase_Record | null = null;
  let isLoadingTasks = true;
  let taskError: string | null = null;
  let newRecordIds = new Set<string>();
  let eventSource: EventSource;

  let toastMessage: string | null = null;
  let toastTimeout: NodeJS.Timeout;
  let computedFee: number = 0;
let personaAction ;
  const feeRules = {
    notary:    (value: number) => value * 0.005 + 500,
    insurance: (value: number) => value * 0.01 + 1000,
    clearance: (value: number) => value * 0.0025 + 100,
    registration: (value: number) => value * 1.5
  };

  const notifyRules = {
    notary: ['insurance', 'clearance'],
    insurance: ['registration'],
    clearance: ['registration'],
    registration: []
  };

  function capitalizeFirst(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  onMount(() => {
    fetchTasks();
    startSSE();
  });

  onDestroy(() => {
    eventSource?.close();
    clearTimeout(toastTimeout);
  });

  async function fetchTasks() {
    isLoadingTasks = true;
    taskError = null;
    try {
      const fetched = await loadPendingPersonaItems(persona);
      tasks = fetched.sort((a, b) => new Date(b.dt_purchase).getTime() - new Date(a.dt_purchase).getTime());
      if(persona===`notary`) personaAction=`Notarize Deed Of Sale`;
      if(persona===`insurance`) personaAction=`Issue Proof of Insurance`;
      if(persona===`clearance`) personaAction=`Confirm Free from Legal Issues`;
      if(persona===`registration`) personaAction=`Provide CR-OR-License Plate`;
    } catch (e: any) {
      taskError = e.message || 'Failed to load tasks.';
    } finally {
      isLoadingTasks = false;
    }
  }

  function showToast(payload: any) {
    toastMessage = `${payload.owner_national_id || 'unknown'}  =>  ${payload.vin || 'VIN unknown'} (${formatCurrency(payload.purchase_value)} ${payload.purchase_type})`;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => (toastMessage = null), 5000);
  }
function startSSE() {
  if (eventSource) eventSource.close();
  eventSource = new EventSource(`/api/broadcast?role=${persona}`);

  eventSource.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data);
      const message = parsed.message ?? parsed;
      console.log('[SSE] Received message:', message);

      if (message?.purchase_id) {
        // Remove existing if found
        tasks = tasks.filter(t => t.purchase_id !== message.purchase_id);
        // Insert updated
        tasks = [message, ...tasks].sort((a, b) =>
          new Date(b.dt_purchase).getTime() - new Date(a.dt_purchase).getTime()
        );
        newRecordIds.add(message.purchase_id);
        // Ensure Svelte reactivity by reassigning the Set
        setTimeout(() => {
          newRecordIds.delete(message.purchase_id);
          newRecordIds = new Set(newRecordIds); // Reassign to trigger reactivity
        }, 2 * 60 * 1000);
        showToast(message);
      }
    } catch (err) {
      console.error('[SSE] Error parsing data:', err, event.data);
    }
  };

  eventSource.onerror = (err) => console.error('[SSE] Connection error:', err);
}


  const formatCurrency = (price?: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price ?? 0);

  $: if (selectedTask) {
    const feeFn = feeRules[persona];
    const value = +selectedTask.purchase_value;
    computedFee = feeFn ? feeFn(value) : 0;
  }

  const renderTaskSummary = (task: Purchase_Record) => `
    <div>${task.owner_national_id.split("-")[1] + "-" + task.owner_national_id.split("-")[2] }</div>
    <div>${formatCurrency(task.purchase_value)}</div>
    <div class="text-xs">${task.source}</div>
    <div class="text-xs">${task.notes.split("|")[0].trim()}</div>
<!--    <div class='md:col-start-3'>-->
    <span class='text-xs text-indigo-600'>${task.purchase_id.split(`-`)[1]}</span></div>
  `;

  async function approvePersona() {
console.log("==========================================");
    console.log('notifyRules:', notifyRules);
console.log('persona:', persona);
console.log('notifyRules[persona]:', notifyRules[persona]);
console.log("==========================================");

    if (!selectedTask) return;
    const notifyTo = notifyRules[persona];
    console.log('Notify to:', notifyTo);

    const payload = {
      purchase_id: selectedTask.purchase_id,
      transaction_type: persona,
      officer_id: selectedTask.owner_national_id,
      dt_transaction: new Date().toISOString(),
      transaction_fee: computedFee,
      notes: `${capitalizeFirst(persona)} approved this transaction`
    };

    const notifyPayload = {
      vin: selectedTask.vin,
      owner_national_id: selectedTask.owner_national_id,
      purchase_value: selectedTask.purchase_value,
      purchase_type: selectedTask.purchase_type,
      purchase_id: selectedTask.purchase_id,
      notes: selectedTask.notes,
      source: selectedTask.source,
      action: capitalizeFirst(persona)
    };
    console.log('Graphine Notify:', notifyTo);
    let wParam =  [JSON.stringify(payload)] ;
    console.log('WPARAM:', wParam);
    try {
      await graphine_notify({
        e: 'vehicles.fn_newltoprocess',
        w: wParam,
        notify: {
          method: 'notifyRoles',
          payload: notifyPayload,
          roles: notifyTo,
          tag: capitalizeFirst(persona)
        }
      });

      showToast(selectedTask);
      tasks = tasks.filter(t => t.purchase_id !== selectedTask!.purchase_id);
      selectedTask = null;
    } catch (err) {
      console.error('❌ Approval error:', err);
      toastMessage = '❌ Failed to approve the transaction.';
    }
  }
</script>

<div class="h-full overflow-y-auto px-2 py-1 space-y-2">
  {#if isLoadingTasks}
    <p class="text-gray-500">Loading tasks...</p>
  {:else if taskError}
    <p class="text-red-500">{taskError}</p>
  {:else if tasks.length === 0}
    <p class="text-gray-400 italic">No pending tasks.</p>
  {:else}
    {#each tasks as task (task.purchase_id)}
      <button
        type="button"
        class={`w-full text-left rounded-xl cursor-pointer shadow transition focus:outline-none focus:ring-2
        focus:ring-offset-2 focus:ring-blue-400 hover:brightness-110 hover:outline-1 relative
        ${task.purchase_type === 'cash' ? 'bg-teal-100' : 'bg-rose-100'} p-3 sm:p-4 ${newRecordIds.has(task.purchase_id) ? 'animate-bounce-short' : ''}`}
        on:click={() => (selectedTask = task)}
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-4 text-sm text-slate-800">
        <div>{task.vin}</div>
        {@html renderTaskSummary(task)}
        </div>
        {#if newRecordIds.has(task.purchase_id)}
          <div class="absolute top-2 right-2 text-rose-700 animate-spin">
            <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.042a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.817-2.042a1 1 0 00-1.176 0l-2.817 2.042c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
            </svg>
          </div>
        {/if}
      </button>
    {/each}
  {/if}
</div>

{#if selectedTask}
  <Comp_InfoModal title="VIN:  {selectedTask.vin}" on:close={() => (selectedTask = null)}>
    <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-4 text-sm text-slate-800 mb-4">
          {@html renderTaskSummary(selectedTask)}
      <p class="text-sm text-indigo-700">Fee: <strong>{formatCurrency(computedFee)}</strong></p>
    </div>
    <div class="text-center mb-4">
      <button class="btn btn-primary" on:click={approvePersona}>{personaAction}</button>
    </div>
    <hr class="my-4 border-t border-gray-300" />
    <!-- History Section -->
    <div class="mt-1 p-1 bg-teal-50 rounded-lg border border-teal-200 shadow-inner space-y-2">
      <Comp_PersonaItemDetails purchase_id={selectedTask.purchase_id} />
    </div>
  </Comp_InfoModal>
{/if}

{#if toastMessage}
  <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-yellow-100 border border-yellow-300 text-yellow-800 text-lg px-6 py-4 rounded-xl shadow-xl animate-fade-in-out">
    {toastMessage}
  </div>
{/if}

<style>
  @keyframes bounce-short {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  .animate-bounce-short {
    animation: bounce-short 0.4s ease-in-out 300; /* Set to 300 iterations for a total duration of 120 seconds */
  }
  @keyframes fade-in-out {
    0% { opacity: 0; transform: scale(0.9); }
    10% { opacity: 1; transform: scale(1); }
    90% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.9); }
  }
  .animate-fade-in-out {
    animation: fade-in-out 5s ease-in-out forwards;
  }
</style>
