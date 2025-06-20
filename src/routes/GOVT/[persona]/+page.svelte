<script lang="ts">
	import type { PageData } from './$types';
	import type { User } from '$lib/types';
	import { loadUsersByPersona } from '$lib/loader';
	import Comp_UsersList from '$lib/components/Comp_UsersList.svelte';
	import Comp_Authentication from '$lib/components/Comp_Authentication.svelte';
	import Comp_UserInfo from '$lib/components/Comp_UserInfo.svelte';

	let { data }: { data: PageData } = $props();
	let view: 'users' | 'details' = $state('users');
	let users = $state<User[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let selectedUser = $state<User | null>(null);
	let authenticatedUser = $state<User | null>(null);
	let isLoggingOut = $state(false);

	let startRect: DOMRect | null = $state(null);
	let authComponent: Comp_Authentication;

	// FIX: This effect is now simplified and robust.
	// It will run whenever the `view` changes.
	$effect(() => {
		// If the current view is 'users', always fetch the list.
		if (view === 'users') {
			isLoading = true;
			error = null;
			loadUsersByPersona(data.persona)
				.then((result) => (users = result))
				.catch((e) => (error = e.message || 'Failed to load user data.'))
				.finally(() => (isLoading = false));
		}
	});

	function getArticle(word: string): 'a' | 'an' {
		return ['a', 'e', 'i', 'o', 'u'].includes(word[0].toLowerCase()) ? 'an' : 'a';
	}

	function handleUserSelect(user: User, rect: DOMRect) {
		startRect = rect;
		selectedUser = user;
	}

	function handleAuthSuccess(loggedInUser: User) {
		authenticatedUser = loggedInUser;
		authComponent.startExitAnimation();
	}

	function handleAuthExitComplete() {
		selectedUser = null;
		startRect = null;
		view = 'details';
	}

	function handleAuthClose() {
		selectedUser = null;
		startRect = null;
	}

	function handleLogout() {
		isLoggingOut = true;
	}

	function handleLogoutComplete() {
		authenticatedUser = null;
		isLoggingOut = false;
		view = 'users'; // This now correctly triggers the $effect to refetch the list.
	}
</script>

<div class="h-screen flex flex-col gap-6 p-4 sm:p-8 bg-base-200">
	<header class="flex-shrink-0 flex items-center justify-between">
		<h1 class="text-3xl font-bold font-spice capitalize">{data.persona} Services</h1>
	</header>

	<div class="flex-grow min-h-0">
		{#if view === 'users'}
			<main class="card bg-base-100 shadow-xl h-full">
				<div class="card-body flex flex-col p-4 sm:p-6">
					<header class="flex-shrink-0">
						<h2 class="card-title text-xl">
							Select {getArticle(data.persona)}
							<span class="capitalize">{data.persona}</span> Officer
						</h2>
						<div class="divider mt-2"></div>
					</header>
					<div class="flex-grow min-h-0 overflow-y-auto custom-scrollbar">
						{#if isLoading}
							<div class="flex h-full items-center justify-center">
								<span class="loading loading-lg loading-dots"></span>
							</div>
						{:else if error}
							<div role="alert" class="alert alert-error">
								<span><strong>Error:</strong> {error}</span>
							</div>
						{:else if users.length === 0}
							<div class="h-full flex flex-col items-center justify-center text-center text-base-content/60">
								<p class="text-lg font-semibold">No Officers Found</p>
								<p class="text-sm mt-1">There are no users available for this category.</p>
							</div>
						{:else}
							<Comp_UsersList {users} onselect={handleUserSelect} />
						{/if}
					</div>
					<footer
						class="flex-shrink-0 h-[100px] flex items-center justify-center rounded-lg bg-base-200 text-base-content/40"
					>
						[Footer Area]
					</footer>
				</div>
			</main>
		{:else if authenticatedUser}
			<div class="h-full flex flex-col gap-6">
				<Comp_UserInfo
					user={authenticatedUser}
					onlogout={handleLogout}
					isLoggingOut={isLoggingOut}
					onlogoutcomplete={handleLogoutComplete}
				/>
				<div class="card bg-base-100 shadow-xl flex-grow min-h-0 p-6">
					<h2 class="text-xl font-bold">Task List</h2>
					<p class="text-base-content/70 mt-4">Coming Soon...</p>
				</div>
			</div>
		{/if}
	</div>
</div>

{#if selectedUser && startRect}
	<Comp_Authentication
		bind:this={authComponent}
		user={selectedUser}
		{startRect}
		onsuccess={handleAuthSuccess}
		onclose={handleAuthClose}
		onexitcomplete={handleAuthExitComplete}
	/>
{/if}

<style>
    :global(.custom-scrollbar) {
        scrollbar-width: thin;
        scrollbar-color: hsl(var(--bc) / 0.4) transparent;
    }
    :global(.custom-scrollbar::-webkit-scrollbar) {
        width: 8px;
    }
</style>