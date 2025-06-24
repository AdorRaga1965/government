<script lang="ts">
	import { graphine } from '$lib/services/Svc_Api';
	import { loadPersonaItem } from '$lib/services/Svc_LTOLoader';
	let { purchase_id }: { purchase_id: string } = $props();

	let history = [];
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	$effect(() => {
		async function loadHistory() {
			history = await loadPersonaItem( purchase_id );
		}
		loadHistory();
	});

	const formatCurrency = (price: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);
	const formatDate = (dateString: string) => new Date(dateString).toLocaleString();
</script>

<div class="view-container">
	{#if isLoading}
		<p>Loading history...</p>
	{:else if error}
		<p class="error-message">Error: {error}</p>
	{:else if history.length > 0}
		<div class="timeline bg-teal-200">
			{#each history as event (event.event_timestamp)}
				<div class="timeline-item">
					<div class="timeline-dot"></div>
					<div class="timeline-content">
						<span class="timestamp">{formatDate(event.event_timestamp)}</span>
						<h3 class="event-type">{event.event_type}</h3>
						<div class="details">
							{#if event.event_type === 'Purchase'}
								<p>Amount: <strong>{formatCurrency(event.event_details.purchase_value)}</strong></p>
								<p>From: {event.event_details.owner_national_id}</p>
								<p>Source: {event.event_details.source}</p>
							{:else}
								<p>Officer: {event.officer_id}</p>
								<p>Fee: <strong>{formatCurrency(event.event_details.transaction_fee)}</strong></p>
								<p>Notes: {event.event_details.notes}</p>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p>No history found for this transaction.</p>
	{/if}
</div>

<style>
	.error-message { color: #ef4444; }
	.timeline { position: relative; padding-left: 2rem; margin-top: 1rem; }
	.timeline::before { content: ''; position: absolute; left: 0.5rem; top: 0; bottom: 0; width: 4px; background-color: #e2e8f0; border-radius: 2px; }
	.timeline-item { position: relative; margin-bottom: 2rem; }
	.timeline-dot { position: absolute; left: -0.25rem; top: 0.25rem; width: 1.5rem; height: 1.5rem; background-color: #4f46e5; border-radius: 50%; border: 4px solid #fff; }
	.timestamp { font-size: 0.8rem; color: #64748b; margin-bottom: 0.25rem; }
	.event-type { font-size: 1.25rem; font-weight: 600; color: #1e293b; margin: 0; }
	.details { font-size: 0.9rem; background: #f8fafc; padding: 0.75rem; border-radius: 6px; margin-top: 0.5rem; }
</style>