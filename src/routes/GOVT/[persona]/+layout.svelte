

<script lang="ts">
	import '/src/app.css';
	// Import our new global notification component.
	import Comp_Notification from '$lib/Components/Comp_Notification.svelte';
</script>

<!-- The Notification component is now part of every page. -->
<Comp_Notification />

<div class="main-container">
	<slot />
</div>

<style>
	.main-container {
		width: 100%;
		height: 100%;
	}
</style>