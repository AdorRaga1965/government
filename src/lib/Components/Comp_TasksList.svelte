<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { enhance } from '$app/forms';
	import { slide } from 'svelte/transition';
	import Comp_Icons from '$lib/Components/Comp_Icons.svelte';
	import type { Purchase_Record as Task } from '$lib/types';

	export let tasks: Task[];

	const dispatch = createEventDispatcher<{ process: FormData }>();
	let openVin = $state<string | null>(null);

	const formatCurrency = (price?: number) =>
		new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price ?? 0);
	const formatDate = (d?: string) =>
		d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
	const isLoan = (t?: string) => t?.toLowerCase() === 'loan';
</script>

<div class="w-full max-w-4xl mx-auto flex flex-col gap-3">
	{#if !tasks || tasks.length === 0}
		<div class="text-center p-12 text-surface-500 bg-surface-100 dark:bg-surface-800 rounded-lg">
			All clear! No pending tasks.
		</div>
	{:else}
		{#each tasks as task (task.purchase_id)}
			<div class="card rounded-lg overflow-hidden transition-all duration-300"
				class:shadow-xl={openVin === task.vin}
				class:ring-2={openVin === task.vin}
				class:ring-primary-500={openVin === task.vin}>
				<header class="flex items-center justify-between p-4 cursor-pointer text-white"
					class:bg-rose-500={isLoan(task.purchase_type)}
					class:dark:bg-rose-700={isLoan(task.purchase_type)}
					class:bg-teal-500={!isLoan(task.purchase_type)}
					class:dark:bg-teal-700={!isLoan(task.purchase_type)}
					onclick={() => (openVin = openVin === task.vin ? null : task.vin)}>
					<div class="flex items-center gap-4">
						<Comp_Icons name={isLoan(task.purchase_type) ? 'loan' : 'cash'} class="w-8 h-8 flex-shrink-0" />
						<div>
							<h3 class="font-bold text-lg font-mono tracking-wider">{task.vin ?? 'NO_VIN'}</h3>
							<p class="text-xs text-white/70">{task.source ?? 'Unknown Source'}</p>
						</div>
					</div>
					<div class="flex items-center gap-4">
						<span class="badge variant-soft-surface hidden sm:block">{formatDate(task.dt_purchase)}</span>
						<Comp_Icons name="chevron" class="transition-transform duration-200 {openVin === task.vin ? 'rotate-90' : ''}" />
					</div>
				</header>

				{#if openVin === task.vin}
					<div transition:slide={{ duration: 300 }} class="p-4 border-t border-surface-200 dark:border-surface-700 space-y-6">
						<section class="p-4 bg-surface-50 dark:bg-surface-900 rounded-xl">
							<dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
								<div>
									<dt class="text-sm text-surface-500">Owner ID</dt>
									<dd class="font-mono text-lg">{task.owner_national_id ?? 'N/A'}</dd>
								</div>
								<div class="sm:text-right">
									<dt class="text-sm text-surface-500">Purchase Value</dt>
									<dd class="font-bold text-lg">{formatCurrency(task.purchase_value)}</dd>
								</div>
								<div>
									<dt class="text-sm text-surface-500">Purchase Date</dt>
									<dd class="text-lg">{formatDate(task.dt_purchase)}</dd>
								</div>
								<div class="sm:text-right">
									<dt class="text-sm text-surface-500">Payment Type</dt>
									<dd class="font-bold text-lg">{task.purchase_type ?? 'N/A'}</dd>
								</div>
							</dl>
						</section>

						<section class="p-4 bg-surface-100 dark:bg-surface-800 rounded-xl border-t border-dashed border-surface-300">
							<form method="POST" action="?/processItem" class="flex flex-col sm:flex-row gap-3"
								use:enhance={() => ({ formData }) => dispatch('process', formData)}>
								<input type="hidden" name="vin" value={task.vin} />
								<input type="hidden" name="purchaseId" value={task.purchase_id} />
								<input type="hidden" name="purchasePrice" value={task.purchase_value} />
								<button type="submit" name="action" value="cancel" class="btn variant-outline-danger flex-1">
									<Comp_Icons name="x" class="w-5 h-5" />
									Cancel
								</button>
								<button type="submit" name="action" value="approve" class="btn variant-filled-primary flex-1">
									<Comp_Icons name="check" class="w-5 h-5" />
									Process Deed of Sale
								</button>
							</form>
						</section>
					</div>
				{/if}
			</div>
		{/each}
	{/if}
</div>

</script>