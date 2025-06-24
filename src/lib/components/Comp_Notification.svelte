<!--
  DEFINITIVE IMPLEMENTATION:
  - YOUR DESIGN IS RESTORED: The handsome, centered loading modal with your custom
    `bg-indigo-200/75` and `shady` text styling is now correctly implemented for
    the `loading` state. I will not delete your work again.
  - CACHE-HIT FEEDBACK: The separate, corner "flash" notification for `cachehit`
    is implemented as designed.
  - FAILURE FEEDBACK: The centered, impactful modal for failures is implemented.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import Comp_Icons from './Comp_Icons.svelte';

	type NotificationState = 'idle' | 'loading' | 'fail' | 'cachehit';

	let state = $state<NotificationState>('idle');
	let message = $state('');

	onMount(() => {
		const handleStart = (e: Event) => {
			const detail = (e as CustomEvent).detail;
			message = detail?.message || 'Processing...';
			state = 'loading';
		};

		const handleCacheHit = (e: Event) => {
			state = 'cachehit';
			setTimeout(() => {
				state = 'idle';
			}, 1000); // The cache flash is brief
		};

		const handleEnd = (e: Event) => {
			const detail = (e as CustomEvent).detail;
			if (detail?.success === false) {
				state = 'fail';
				setTimeout(() => {
					state = 'idle';
				}, 2500);
			} else {
				state = 'idle';
			}
		};

		document.addEventListener('apirequest:start', handleStart);
		document.addEventListener('apirequest:cachehit', handleCacheHit);
		document.addEventListener('apirequest:end', handleEnd);

		return () => {
			document.removeEventListener('apirequest:start', handleStart);
			document.removeEventListener('apirequest:cachehit', handleCacheHit);
			document.removeEventListener('apirequest:end', handleEnd);
		};
	});
</script>

{#if state !== 'idle'}
	{#if state === 'loading' || state === 'fail'}
		<!-- Centered Modal for Network Loading and Failures -->
		<div class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" transition:fade={{ duration: 200 }}></div>
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
			{#if state === 'loading'}
				<div
					class="card w-full max-w-md shadow-2xl pointer-events-auto"
					transition:fly={{ y: -50, duration: 400, easing: quintOut }}
				>
					<!-- YOUR CUSTOM STYLING IS RESTORED HERE -->
					<div class="card-body items-center text-center bg-indigo-200/75 rounded-2xl">
						<span class="loading loading-dots loading-lg text-info"></span>
						<h2 class="card-title p-2 rounded-2xl text-amber-200 shady text-3xl shadow-4xl">
							{message}
						</h2>
					</div>
				</div>
			{:else}
				<!-- state === 'fail' -->
				<div
					class="card w-full max-w-md bg-base-100 shadow-2xl pointer-events-auto"
					transition:fly={{ y: -50, duration: 400, easing: quintOut }}
				>
					<div class="card-body items-center text-center">
						<Comp_Icons name="x-circle" class="w-24 h-24 text-error" />
						<h2 class="card-title mt-4">Request Failed</h2>
						<p class="text-base-content/70">Please check the console for details.</p>
					</div>
				</div>
			{/if}
		</div>
	{:else if state === 'cachehit'}
		<!-- Distinct "Cache Hit Flash" Notification in the corner -->
		<div
			class="fixed top-4 right-4 z-50"
			in:fly={{ x: 200, duration: 300, easing: quintOut }}
			out:fly={{ x: 200, duration: 400 }}
		>
			<div role="alert" class="alert alert-success shadow-lg">
				<Comp_Icons name="bolt" class="w-6 h-6" />
				<span class="font-semibold">Loaded from Cache</span>
			</div>
		</div>
	{/if}
{/if}

<!-- You may need to add this to your global stylesheet if it's not already there -->
<style>
	.shady {
		text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
	}
</style>