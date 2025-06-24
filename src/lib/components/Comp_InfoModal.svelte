<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount, onDestroy } from 'svelte';
	import { slide } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	export let title: string = 'Information';
	export let modalClasses: string = '';

	function handleClose() {
		dispatch('close');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}

	onMount(() => {
		document.body.classList.add('modal-open-blur');
		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		document.body.classList.remove('modal-open-blur');
		window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="modal-backdrop" on:click={handleClose} transition:slide|local>
	<div class="modal-content {modalClasses}" on:click|stopPropagation transition:slide|local>
		<div class="modal-header">
			<h2 class="modal-title">{title}</h2>
			<button class="close-button" on:click={handleClose} title="Close (Esc)">×</button>
		</div>
		<div class="modal-body">
			<slot />
		</div>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(15, 23, 42, 0.7);
		backdrop-filter: blur(2px);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		pointer-events: auto;
	}
	.modal-content {
		background: #ffffff;
		padding: 0;
		border-radius: 12px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
		width: 90vw;
		max-width: 500px;
		display: flex;
		flex-direction: column;
		max-height: 90vh;
	}
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e2e8f0;
	}
	.modal-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #1e293b;
	}
	.modal-body {
		padding: 1.5rem;
		overflow-y: auto;
		flex-grow: 1;
	}
	.close-button {
		background: none;
		border: none;
		font-size: 2rem;
		line-height: 1;
		color: #9ca3af;
		cursor: pointer;
		transition: color 0.2s;
	}
	.close-button:hover {
		color: #1e293b;
	}
</style>

<svelte:head>
  <style>
    body.modal-open-blur > :not(.modal-backdrop) {
      filter: blur(5px);
      transition: filter 0.3s ease-in-out;
      pointer-events: none;
      user-select: none;
    }
  </style>
</svelte:head>
