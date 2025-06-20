<script lang="ts">
	import { onMount } from 'svelte';
	import { clockService } from '$lib/components/clock.service'; // Adjust path if needed

	let container: HTMLDivElement | null = $state(null);

	onMount(() => {
		if (!container) return; // Ensure container is set

		container.innerHTML = ''; // Clear previous content if any
		const canvas = document.createElement('canvas');
		canvas.id = 'svelte-clock-canvas';
		const size = 600;
		canvas.width = size;
		canvas.height = size;
		container.appendChild(canvas);

		const skin = {
			isMetric: true,
			clockFace: 'lightgray',
			hourColor: 'navy',
			digitColor: 'white',
			tickColor: 'gray',
			tickWidth: 2,
			isUpright: false
		};
		clockService.init({ canvas, skin });
	});
</script>


<div class="grid clock-container place-items-center max-h-screen">
    <div class="text-4xl text-zinc-100 text-center">PROPOSED METRIC CLOCK</div>
    <div bind:this={container} id="svelte-clock-container"></div>
</div>
