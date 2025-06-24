<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { slide } from 'svelte/transition';

	// Props for the toast message
	let { message, type = 'success', duration = 6000, onclose = () => {} } = $props<{
		message: string;
		type?: 'success' | 'error';
		duration?: number;
		onclose: () => void;
	}>();

	let timer: any;

	// When the component mounts, start a timer to close it automatically.
	onMount(() => {
		timer = setTimeout(onclose, duration);
	});

	// It's crucial to clear the timer if the component is destroyed early.
	onDestroy(() => {
		clearTimeout(timer);
	});
</script>

<div class="toast-container" transition:slide={{ duration: 800, y: -50 }}>
	<div class="toast" class:success={type === 'success'} class:error={type === 'error'}>
		<div class="icon">
			{#if type === 'success'}
				<span>✔️</span>
			{:else}
				<span>❌</span>
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
		z-index: 9999;
	}
	.toast {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		box-shadow: 2 4px 12px rgba(10,0,0,0.25);
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