<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';

  // Add iconType as a prop
  let { message, type = 'success', duration = 6000, onclose = () => {}, iconType } = $props<{
   message: string;
   type?: 'success' | 'error';
   duration?: number;
   onclose: () => void;
   iconType?: string; // New prop for icon type
  }>();

  let timer: any;

  onMount(() => {
   timer = setTimeout(onclose, duration);
  });

  onDestroy(() => {
   clearTimeout(timer);
  });

  // The getIconPath function is no longer needed here as iconType comes directly via props.
  // The iconSrc derived state will now use iconType.
  const iconSrc = iconType ? `/icons/${iconType}.gif` : null;
</script>

<div class="toast-container" transition:slide={{ duration: 800, y: -50 }}>
<div class="toast" class:success={type === 'success'} class:error={type === 'error'}>
  <div class="icon">
   {#if type === 'success'}
    <span>✔️</span>
   {:else if type === 'error'}
    <span>❌</span>
   {/if}
    {#if iconSrc}
     <img src={iconSrc} alt="status icon" class="w-5 h-5" />
    {/if}
  </div>
   <p>{message}</p>
   <button class="close-button" onclick={onclose}>×</button>
  </div>
</div>

<style>
  .toast-container {
   position: fixed;
   top: 1rem;
   left: 50%;
   transform: translateX(-50%);
   z-index: 999999;
  }
  .toast {
   display: flex;
   align-items: center;
   gap: 1rem;
   padding: 0.75rem 1.5rem;
   border-radius: 8px;
   box-shadow: 0 4px 12px rgba(10,0,0,0.25);
   color: white;
   font-size: 16px;
   min-width: 300px;
  }
  .toast.success { background-color: #22c55e; } /* Green-500 */
  .toast.error   { background-color: #ef4444; } /* Red-500 */
  .icon { font-size: 1.25rem; }
  .toast p { margin: 0; font-weight: 800; }
  .close-button {
   margin-left: auto;
   background: none;
   border: none;
   color: white;
   opacity: 0.7;
   font-size: 1.5rem;
   line-height: 1;
   cursor: pointer;
  }
  .close-button:hover { opacity: 1; }
</style>