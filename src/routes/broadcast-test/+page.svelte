<!--
  DEFINITIVE CODE CLEANUP:
  - The unnecessary `svelte-sonner` import has been removed.
  - The `$effect` block that was showing local toast notifications has been removed.
  - This page is now clean and correctly relies on the global notification system.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import Cont_TableWizard from '$lib/Containers/Cont_TableWizard.svelte';
	import { filipinoConfig } from '$lib/Configs/Conf_Filipinos';
	import type { FilipinoPerson } from '$lib/types';

	let { form }: { form: ActionData } = $props();

	let activeTab = $state('users');
	let selectedPersona = $state('buyer');
	let selectedFilipino = $state<FilipinoPerson | undefined>(undefined);
	const selectedFilipinoId = $derived(selectedFilipino?.national_id);
</script>

<div class="p-4 sm:p-8 bg-base-200 min-h-screen">
	<h1 class="text-3xl font-bold mb-4">Broadcast Test Panel</h1>

	<div role="tablist" class="tabs tabs-lifted">
		<a
			role="tab"
			class="tab"
			class:tab-active={activeTab === 'users'}
			onclick={() => (activeTab = 'users')}>Users</a
		>
		<a
			role="tab"
			class="tab"
			class:tab-active={activeTab === 'banks'}
			onclick={() => (activeTab = 'banks')}>Banks</a
		>
		<a
			role="tab"
			class="tab"
			class:tab-active={activeTab === 'tasks'}
			onclick={() => (activeTab = 'tasks')}>Tasks</a
		>
	</div>

	<div class="bg-base-100 p-6 rounded-b-box rounded-tr-box shadow-lg min-h-[500px]">
		<div class:hidden={activeTab !== 'users'}>
			<form method="POST" action="?/addUser" use:enhance class="max-w-4xl mx-auto">
				<h2 class="text-2xl font-bold mb-6 text-center">Add Transaction Officer</h2>

				<div class="card bg-base-200 shadow-inner mb-6">
					<div class="card-body">
						<h3 class="card-title">Step 1: Select Person</h3>
						<input type="hidden" name="national_id" value={selectedFilipinoId} />
						<div class="h-96">
							<Cont_TableWizard
								title={filipinoConfig.title}
								columns={filipinoConfig.columns}
								searchOptions={filipinoConfig.searchOptions}
								rowIdKey={filipinoConfig.rowIdKey}
								endpoint={filipinoConfig.endpoint}
								ddlEndpointPrefix={filipinoConfig.ddlEndpointPrefix}
								bind:details={selectedFilipino}
							/>
						</div>
						{#if selectedFilipino}
							<div class="alert alert-success mt-4">
								<p>
									Selected: <strong>{selectedFilipino.fullname}</strong> ({selectedFilipino.national_id})
								</p>
							</div>
						{/if}
					</div>
				</div>

				<div class="card bg-base-200 shadow-inner mb-6">
					<div class="card-body">
						<h3 class="card-title">Step 2: Assign Persona Role</h3>
						<div class="form-control">
							<div class="join">
								{#each ['buyer', 'notary', 'insurance', 'clearance', 'registration'] as persona}
									<input
										class="join-item btn"
										type="radio"
										name="persona"
										bind:group={selectedPersona}
										aria-label={persona.charAt(0).toUpperCase() + persona.slice(1)}
										value={persona}
									/>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<button type="submit" class="btn btn-primary w-full btn-lg" disabled={!selectedFilipino}
					>Add Officer</button
				>
			</form>
		</div>

		<div class:hidden={activeTab !== 'banks'}>
			<p>Bank broadcast form will go here.</p>
		</div>
		<div class:hidden={activeTab !== 'tasks'}>
			<p>Task broadcast form will go here.</p>
		</div>
	</div>
</div>