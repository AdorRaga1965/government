<script lang="ts">
  import { loadPersonaItem } from '$lib/services/Svc_DB';
  let { purchase_id }: { purchase_id: string } = $props();
  let history = [];
  let isLoading = $state(true);
  let error = $state<string | null>(null);

  $effect(() => {
    async function loadHistory() {
      isLoading = true;
      error = null;
      try {
        history = await loadPersonaItem(purchase_id);
      } catch (err: any) {
        error = err.message || 'Failed to load history.';
      } finally {
        isLoading = false;
      }
    }
    loadHistory();
  });

  function capitalizeFirst(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  const formatCurrency = (price: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  function getEventIcon(eventType: string) {
    switch (eventType.toLowerCase()) {
      case 'purchase': return '🛒';
      case 'notary': return '📋';
      case 'insurance': return '🛡️';
      case 'clearance': return '✅';
      case 'registration': return '📄';
      default: return '📌';
    }
  }

  function getEventColor(eventType: string) {
    switch (eventType.toLowerCase()) {
      case 'purchase': return 'bg-blue-500';
      case 'notary': return 'bg-teal-500';
      case 'insurance': return 'bg-purple-500';
      case 'clearance': return 'bg-green-500';
      case 'registration': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  }
</script>

<div class="h-full overflow-y-auto p-2">
  {#if isLoading}
    <div class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      <p class="ml-3 text-gray-600">Loading history...</p>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <div class="text-red-600 mb-2">⚠️</div>
      <p class="text-red-700 font-medium">Error loading history</p>
      <p class="text-red-600 text-sm">{error}</p>
    </div>
  {:else if history.length > 0}
    <div class="timeline-container">
      <div class="timeline-header mb-4">
        <h3 class="text-base font-semibold text-gray-800 flex items-center gap-2">
          <span class="text-teal-600">📜</span>
          Transaction History
          <span class="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
            {history.length} event{history.length !== 1 ? 's' : ''}
          </span>
        </h3>
      </div>

      <div class="cards-grid">
        {#each history as event (event.event_timestamp)}
          <div class="event-card">
            <div class="event-header">
              <div class="event-icon {getEventColor(event.event_type)}">
                {getEventIcon(event.event_type)}
              </div>
              <div class="event-info">
                <h4 class="event-title">{capitalizeFirst(event.event_type)}</h4>
                <time class="event-time">{formatDate(event.event_timestamp)}</time>
              </div>
            </div>

            <div class="event-details">
              {#if event.event_type === 'Purchase'}
                <div class="detail-item">
                  <span class="detail-label">Amount</span>
                  <span class="detail-value amount">{formatCurrency(event.event_details.purchase_value)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Owner</span>
                  <span class="detail-value">{event.event_details.owner_national_id}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Source</span>
                  <span class="detail-value">{event.event_details.source}</span>
                </div>
              {:else}
                <div class="detail-item">
                  <span class="detail-label">Officer</span>
                  <span class="detail-value">{event.officer_id}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Fee</span>
                  <span class="detail-value amount">{formatCurrency(event.event_details.transaction_fee)}</span>
                </div>
                {#if event.event_details.notes}
                  <div class="detail-item">
                    <span class="detail-label">Notes</span>
                    <span class="detail-value notes">{event.event_details.notes}</span>
                  </div>
                {/if}
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="empty-state">
      <div class="text-gray-400 text-4xl mb-3">📋</div>
      <p class="text-gray-500 font-medium">No transaction history</p>
      <p class="text-gray-400 text-sm">This transaction doesn't have any recorded events yet.</p>
    </div>
  {/if}
</div>

<style>
  .timeline-container {
    max-width: 100%;
  }

  .cards-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .event-card {
    flex: 1;
    min-width: 250px;
    max-width: calc(50% - 0.2rem);
    background: linen;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
  }

  .event-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .event-header {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-bottom: 0.25rem;
  }

  .event-icon {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    flex-shrink: 0;
    filter: grayscale(0.2) brightness(1.1);
  }

  .event-info {
    flex: 1;
    min-width: 0;
  }

  .event-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
  }

  .event-time {
    font-size: 0.75rem;
    color: #6b7280;
    line-height: 1.2;
  }

  .event-details {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.1rem;
  }

  .detail-label {
    font-size: 0.8rem;
    font-weight: 500;
    color: maroon;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .detail-value {
    font-size: 0.8rem;
    color: #374151;
    font-weight: 500;
    text-align: right;
    word-break: break-word;
  }

  .detail-value.amount {
    color: #059669;
    font-weight: 600;
  }

  .detail-value.notes {
    font-style: italic;
    color: #6b7280;
    font-weight: 500;
    line-height: 1.1;
    text-align: left;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem 1rem;
    text-align: center;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .event-card {
      max-width: 100%;
      min-width: 100%;
    }
  }

  @media (max-width: 480px) {
    .event-card {
      padding: 0.2rem;
    }

    .event-icon {
      width: 28px;
      height: 28px;
      font-size: 12px;
    }

    .event-title {
      font-size: 0.9rem;
    }

    .detail-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.1rem;
    }

    .detail-value {
      text-align: left;
    }
  }
</style>