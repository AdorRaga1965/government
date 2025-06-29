<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';

  let showOverlay = false;
  let overlayMessage = 'Loading...';
  let overlayIconType: string | null = null;
  let timer: ReturnType<typeof setTimeout>;

  function getGifPath(type: string | null): string | null {
    if (!type) return null;
    const verbs = ['Loading', 'Searching', 'Filtering', 'Creating'];
    if (verbs.includes(type)) {
      return `/icons/${type}.gif`;
    }
    return null;
  }

  function handleApiRequestStart(event: CustomEvent) {
    showOverlay = true;
    overlayMessage = event.detail?.message || 'Processing...';
    overlayIconType = event.detail?.iconType || null;
    clearTimeout(timer);
  }

  function handleApiRequestEnd() {
    timer = setTimeout(() => {
      showOverlay = false;
      overlayMessage = 'Loading...';
      overlayIconType = null;
    }, 500);
  }

  onMount(() => {
    document.addEventListener('apirequest:start', handleApiRequestStart as EventListener);
    document.addEventListener('apirequest:end', handleApiRequestEnd as EventListener);
  });

  onDestroy(() => {
    document.removeEventListener('apirequest:start', handleApiRequestStart as EventListener);
    document.removeEventListener('apirequest:end', handleApiRequestEnd as EventListener);
    clearTimeout(timer);
  });
</script>

{#if showOverlay}
  <div
    class="fixed inset-0 flex items-center justify-center z-[9999999] bg-black bg-opacity-30 backdrop-blur-sm"
    transition:fade={{ duration: 150 }}
  >
    <div
      class="bg-white p-6 rounded-lg shadow-2xl flex flex-col items-center gap-4 text-center text-gray-800"
      aria-live="polite"
      aria-atomic="true"
    >
      {#if getGifPath(overlayIconType)}
        <img src={getGifPath(overlayIconType)} alt="Status icon" class="w-12 h-12" />
      {/if}
      <p class="text-lg font-semibold">{overlayMessage}</p>
    </div>
  </div>
{/if}

<style>
</style>
