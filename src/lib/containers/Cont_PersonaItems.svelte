<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Comp_InfoModal from '$lib/components/Comp_InfoModal.svelte';
	import type { Purchase_Record } from '$lib/types';
	import { loadPendingPersonaItems } from '$lib/services/Svc_LTOLoader';

	export let persona: string;

	let tasks: Purchase_Record[] = [];
	let selectedTask: Purchase_Record | null = null;
	let isLoadingTasks = true;
	let taskError: string | null = null;
	let newRecordIds = new Set<string>();

	let eventSource: EventSource;

	onMount(() => {
		fetchTasks();
		startSSE();
	});

	onDestroy(() => {
		eventSource?.close();
	});

	async function fetchTasks() {
		isLoadingTasks = true;
		taskError = null;
		try {
			tasks = await loadPendingPersonaItems(persona);
		} catch (e: any) {
			taskError = e.message || 'Failed to load tasks.';
		} finally {
			isLoadingTasks = false;
		}
	}

	function startSSE() {
		eventSource = new EventSource(`/api/broadcast?role=${persona}`);
		eventSource.onmessage = (event) => {
			try {
				const { LTO_Step, message } = JSON.parse(event.data);
				if (LTO_Step === persona && message?.purchase_id) {
					const alreadyExists = tasks.some(t => t.purchase_id === message.purchase_id);
					if (!alreadyExists) {
						tasks = [...tasks, message];
						newRecordIds.add(message.purchase_id);
						setTimeout(() => newRecordIds.delete(message.purchase_id), 2 * 60 * 1000);
					}
				}
			} catch (err) {
				console.error('Error parsing SSE data:', err);
			}
		};

		eventSource.onerror = (err) => {
			console.error('SSE error:', err);
			// Optionally attempt reconnect
			// setTimeout(startSSE, 5000);
		};
	}

	const formatCurrency = (price?: number) =>
		new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP'
		}).format(price ?? 0);
</script>

<div class="h-full overflow-y-auto px-4 py-6 space-y-3">
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
				role="button"
				class={`w-full text-left rounded-xl shadow transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 ${
					task.purchase_type === 'cash' ? 'bg-teal-200' : 'bg-rose-200'
				} p-3 sm:p-4 ${newRecordIds.has(task.purchase_id) ? 'animate-bounce-short' : ''}`}
				on:click={() => (selectedTask = task)}
			>
				<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-4 text-sm text-slate-800">
					<div><strong>VIN:</strong> {task.vin || 'N/A'}</div>
					<div><strong>Buyer:</strong> {task.owner_national_id || 'N/A'}</div>
					<div><strong>Value:</strong> {formatCurrency(+task.purchase_value)}</div>
					<div><strong>Origin:</strong> {task.source}</div>
					<div class="md:col-start-3">
						<strong>ID:</strong>
						<span class="underline text-blue-600">{task.purchase_id}</span>
					</div>
				</div>
			</button>
		{/each}
	{/if}
</div>

{#if selectedTask}
	<Comp_InfoModal title="Purchase Record Details" on:close={() => (selectedTask = null)}>
		<div class="mb-2">
			<pre class="text-sm bg-slate-100 p-3 rounded whitespace-pre-wrap break-words">
{JSON.stringify(selectedTask, null, 2)}
			</pre>
		</div>

		<hr class="my-4 border-t border-gray-300" />

		<div class="text-sm text-gray-600 italic">History</div>

		<div class="mt-2 p-2 border border-dashed border-gray-400 text-center text-sm text-gray-500 rounded">
			COMING SOON
		</div>
	</Comp_InfoModal>
{/if}

<style>
	@keyframes bounce-short {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-6px); }
	}

	.animate-bounce-short {
		animation: bounce-short 0.4s ease-in-out 3;
	}
</style>
