<script lang="ts">
	import { onMount } from 'svelte';
	// import "/src/app.css";

	// The app icon for the logo area
	const appIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>`;

	// --- CHANGE 1: ADD A "highlight" PROPERTY TO THE DATA ---
	// We add a property to our data to control which item gets special styling.
	// This is a clean, data-driven approach.
	const menuGroups = [
		{
			title: 'Personal',
			items: [
				{ label: 'About Me', path: '/My Profile.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clip-rule="evenodd" /></svg>` },
				{ label: 'My Growth Plan', path: '/Percentile Ranking.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M2 3a1 1 0 0 1 1-1h1.755a1 1 0 0 1 .962.723l.223.892a1 1 0 0 1-.225 1.054l-1.12 1.12a.998.998 0 0 0 0 1.414l1.12 1.12a1 1 0 0 1 .225 1.054l-.223.892a1 1 0 0 1-.962.723H3a1 1 0 0 1-1-1V3Z" /><path d="M7 3a1 1 0 0 1 1-1h1.755a1 1 0 0 1 .962.723l.223.892a1 1 0 0 1-.225 1.054l-1.12 1.12a.998.998 0 0 0 0 1.414l1.12 1.12a1 1 0 0 1 .225 1.054l-.223.892a1 1 0 0 1-.962.723H8a1 1 0 0 1-1-1V3Z" /><path d="M12 3a1 1 0 0 1 1-1h1.755a1 1 0 0 1 .962.723l.223.892a1 1 0 0 1-.225 1.054l-1.12 1.12a.998.998 0 0 0 0 1.414l1.12 1.12a1 1 0 0 1 .225 1.054l-.223.892a1 1 0 0 1-.962.723H13a1 1 0 0 1-1-1V3Z" /></svg>` },
			]
		},
		{
			title: 'Application Portals',
			items: [
				{ label: 'Filipin.Us', path: '/Filipinus.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 0 0 .41-1.412A9.99 9.99 0 0 0 10 12a9.99 9.99 0 0 0-6.535 2.493Z" /></svg>`},
				{ label: 'Account Registration', path: '/Account Registration.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path d="M12.98 12.72a4.98 4.98 0 1 0-8.96 1.463l-2.5 2.5a1 1 0 0 0 1.414 1.414l2.5-2.5a4.98 4.98 0 0 0 7.546-2.877Z" /></svg>`},
				{ label: 'Government Portal', path: '/Government.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V6.663a1.5 1.5 0 0 0-.44-1.06L13.4 2.44A1.5 1.5 0 0 0 12.34 2H4.5Zm4.75-.5a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 .75.75h2.5a.75.75 0 0 0 .75-.75v-2.5a.75.75 0 0 0-.75-.75h-2.5Z" clip-rule="evenodd" /></svg>`},
				{ label: 'National ID', path: '/National ID.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h.5a1.5 1.5 0 0 0 1.5-1.5V6.663a1.5 1.5 0 0 0-.44-1.06L18.4 2.44A1.5 1.5 0 0 0 17.34 2h-1.84Z" clip-rule="evenodd" /><path fill-rule="evenodd" d="M4 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm0 14h8V4H4v12Z" clip-rule="evenodd" /></svg>`},
				{ label: 'Proof of Concept', path: '/lto', highlight: true, icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M10.832 2.222a1.5 1.5 0 0 1 2.336 0l5.25 6.75a1.5 1.5 0 0 1-.918 2.528H2.5a1.5 1.5 0 0 1-.918-2.528l5.25-6.75ZM10 12.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" /></svg>` },
			]
		},
		{
			title: 'Technical Docs',
			items: [
				{ label: 'Our Database Philosophy', path: '/Mastering Database Architecture.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3A1.5 1.5 0 0 1 13 3.5v1.259a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 7 4.759V3.5ZM8.5 7A1.5 1.5 0 0 0 7 8.5v1.259a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5V8.5A1.5 1.5 0 0 0 11.5 7h-3Z" /><path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h13A1.5 1.5 0 0 1 18 5.5v1.259a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 6.759V5.5Z" /><path d="M2 12.5A1.5 1.5 0 0 1 3.5 11h13A1.5 1.5 0 0 1 18 12.5v1.259a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 13.759V12.5Z" /></svg>`},
				{ label: 'ContVehicles API', path: '/ContVehicles API.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M10.832 2.222a1.5 1.5 0 0 1 2.336 0l5.25 6.75a1.5 1.5 0 0 1-.918 2.528H2.5a1.5 1.5 0 0 1-.918-2.528l5.25-6.75ZM10 12.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" /></svg>`},
				{ label: 'Vehicle AI Feedback', path: '/Vehicle AI Feedback.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M6.425 3.425a.75.75 0 0 1 0 1.06l-1.373 1.374.002.002.002.002.002.002.002.002.002.002a2.5 2.5 0 0 0 3.536 3.536l.002.002.002.002.002.002.002.002.002.002 1.374-1.373a.75.75 0 1 1 1.06 1.06l-1.373 1.374a4 4 0 0 1-5.657-5.657l1.373-1.374a.75.75 0 0 1 1.06 0Zm-2.899 8.131a.75.75 0 1 0 1.06-1.06l-1.373-1.374a4 4 0 0 1 5.656-5.656l1.374 1.373a.75.75 0 0 0 1.06-1.06l-1.374-1.373a5.5 5.5 0 0 0-7.778 7.778l1.373 1.373Zm9.126 3.823a.75.75 0 0 1-1.06 0l-1.373-1.374a2.5 2.5 0 0 0-3.536-3.536L4.323 14.84a.75.75 0 0 0 1.06 1.06L6.757 14.5a4 4 0 0 1 5.657 5.657l-1.374-1.373a.75.75 0 1 0-1.06 1.06l1.373 1.373a5.5 5.5 0 0 0 7.778-7.778l-1.373-1.373Z" clip-rule="evenodd" /></svg>`},
				{ label: 'DB Design Session', path: '/Database Design Session 6-11-2025.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2Z" /><path fill-rule="evenodd" d="M8.5 5.5a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3ZM9 8.75A.75.75 0 0 1 9.75 8h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 9 8.75Z" clip-rule="evenodd" /><path d="M4.588 8.243a.75.75 0 0 1 1.06 0l1.432 1.432a.75.75 0 0 1-1.06 1.06l-1.432-1.432a.75.75 0 0 1 0-1.06Z" /><path d="M15.412 8.243a.75.75 0 0 0-1.06 0l-1.432 1.432a.75.75 0 0 0 1.06 1.06l1.432-1.432a.75.75 0 0 0 0-1.06Z" /><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-1.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z" clip-rule="evenodd" /></svg>`},
				{ label: 'Sanity Check', path: '/sanity check.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2Z" /><path fill-rule="evenodd" d="M8.5 5.5a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3ZM9 8.75A.75.75 0 0 1 9.75 8h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 9 8.75Z" clip-rule="evenodd" /><path d="M4.588 8.243a.75.75 0 0 1 1.06 0l1.432 1.432a.75.75 0 0 1-1.06 1.06l-1.432-1.432a.75.75 0 0 1 0-1.06Z" /><path d="M15.412 8.243a.75.75 0 0 0-1.06 0l-1.432 1.432a.75.75 0 0 0 1.06 1.06l1.432-1.432a.75.75 0 0 0 0-1.06Z" /><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-1.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z" clip-rule="evenodd" /></svg>`},
			]
		},
			{
			title: 'Personal Commitment',
			items: [
				{ label: 'Letter to the President', path: '/Letter to the President.html', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3A1.5 1.5 0 0 1 13 3.5v1.259a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 7 4.759V3.5ZM8.5 7A1.5 1.5 0 0 0 7 8.5v1.259a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5V8.5A1.5 1.5 0 0 0 11.5 7h-3Z" /><path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h13A1.5 1.5 0 0 1 18 5.5v1.259a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 6.759V5.5Z" /><path d="M2 12.5A1.5 1.5 0 0 1 3.5 11h13A1.5 1.5 0 0 1 18 12.5v1.259a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 13.759V12.5Z" /></svg>`},

			]
		}
	];

	// The rest of the script is unchanged
	const defaultPath = '/My Profile.html';
	let iframeSrc = $state(defaultPath);
	let activePath = $state(defaultPath);

	function navigate(path: string) {
		iframeSrc = path;
		activePath = path;
	}

	onMount(() => {
		navigate(defaultPath);
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="page-container">
	<aside class="sidebar">
		<div class="sidebar-header">
			{@html appIcon}
			<h1 class="text-xl font-bold text-white">Filipin.Us</h1>
		</div>

		<nav class="sidebar-nav">
			{#each menuGroups as group}
				<div class="nav-group">
					<h3 class="nav-group-title">{group.title}</h3>
					{#each group.items as item}
						<!-- --- CHANGE 2: NEW HTML STRUCTURE FOR THE BUTTON --- -->
						<!-- We wrap the main content and add a conditional badge -->
						<button
							onclick={() => navigate(item.path)}
							class="menu-button"
							class:active={activePath === item.path}
						>
							<!-- This wrapper keeps the icon and label together on the left -->
							<div class="menu-item-content">
								<span class="icon-wrapper">{@html item.icon}</span>
								<span>{item.label}</span>
							</div>
							<!-- This badge only appears if `highlight: true` is set in the data -->
							{#if item.highlight}
								<span class="highlight-badge">POC</span>
							{/if}
						</button>
					{/each}
				</div>
			{/each}
		</nav>
	</aside>

	<main class="main-content">
		<div class="iframe-container">
			<iframe
				class="w-full h-full"
				title="frameHolder"
				src={iframeSrc}
				style="border: none;"
			></iframe>
		</div>
	</main>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
	:global(body) { margin: 0; }

	/* --- LAYOUT & STRUCTURE (Unchanged) --- */
	.page-container {
		display: flex;
		height: 100vh;
		background-color: #f3f4f6;
		font-family: 'Poppins', sans-serif;
	}
	.sidebar {
		width: 280px; flex-shrink: 0; display: flex; flex-direction: column;
		background-image: linear-gradient(to bottom, #1f2937, #111827);
		color: #d1d5db;
	}
	.main-content {
		flex-grow: 1; display: flex; flex-direction: column; padding: 1.5rem; overflow: hidden;
	}
	.iframe-container {
		flex-grow: 1; width: 100%; background-color: white; border-radius: 0.75rem;
		box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
		min-height: 0;
	}

	/* --- SIDEBAR STYLING (Unchanged) --- */
	.sidebar-header {
		display: flex; align-items: center; gap: 0.75rem; padding: 1.5rem;
		border-bottom: 1px solid #374151;
	}
	.sidebar-nav {
		flex-grow: 1; padding: 1rem 0.75rem; overflow-y: auto;
	}
	.nav-group { margin-bottom: 1.5rem; }
	.nav-group-title {
		padding: 0 1rem; margin-bottom: 0.5rem; font-size: 0.75rem; font-weight: 600;
		color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;
	}
	.icon-wrapper {
		width: 1.5rem; height: 1.5rem; flex-shrink: 0; display: grid; place-items: center;
	}

	/* --- CHANGE 3: UPGRADED MENU BUTTON STYLES --- */
	.menu-button {
		width: 100%;
		display: flex;
		align-items: center;
		/* This is the key change: it pushes content to the edges */
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		text-align: left;
		font-size: 0.9rem;
		font-weight: 500;
		color: #d1d5db;
		position: relative;
		transition: all 0.2s ease-in-out;
	}

	.menu-item-content {
		display: flex;
		align-items: center;
		gap: 1rem; /* This maintains the space between icon and text */
	}

	.menu-button:hover {
		background-color: #374151;
		color: white;
	}

	.menu-button.active {
		background-color: #2563eb; color: white; font-weight: 600;
		box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.3);
	}

	.menu-button.active::before {
		content: ''; position: absolute; left: 0; top: 20%;
		height: 60%; width: 4px; background-color: #eff6ff;
		border-radius: 0 4px 4px 0;
	}

	/* --- CHANGE 4: NEW STYLES FOR THE HIGHLIGHT BADGE --- */
	.highlight-badge {
		background-color: #f59e0b; /* A vibrant amber/yellow */
		color: #422006; /* A dark brown for high contrast */
		font-size: 0.65rem; /* 10px */
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 0.75rem; /* 12px, fully rounded pill shape */
		line-height: 1;
		text-transform: uppercase;
	}

	/* --- SCROLLBAR (Unchanged) --- */
	.sidebar-nav::-webkit-scrollbar { width: 6px; }
	.sidebar-nav::-webkit-scrollbar-track { background: transparent; }
	.sidebar-nav::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }
	.sidebar-nav::-webkit-scrollbar-thumb:hover { background: #6b7280; }
</style>