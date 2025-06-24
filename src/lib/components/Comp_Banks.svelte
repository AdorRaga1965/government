<script lang="ts">
	import { loadBanks } from '$lib/services/Svc_LTOLoader';
	let { selectedBranchId = $bindable() } = $props<{selectedBranchId: number | undefined;}>();
	let banksPromise = loadBanks();
	let selectedBankName = $state('');

	function getBranches(banks: any, bankName: string): any[] {
		if (!bankName) return [];
		return banks.filter((b:any) => b.name === bankName);
	}

	$effect(() => {	if (selectedBankName) {	selectedBranchId = undefined;	}});

</script>
	{#await banksPromise}
	{:then banks}
		{@const uniqueBankNames = [...new Set(banks.map((b) => b.name))]}
		{@const availableBranches = getBranches(banks, selectedBankName)}
			<select id="bank-name-select" class="select w-full m-0 py-0 text-xl h-12 bg-rose-200" bind:value={selectedBankName}>
				<option disabled selected value="">Select a bank</option>
				{#each uniqueBankNames as name (name)}
					<option value={name}>{name}</option>
				{/each}
			</select>
		{#if selectedBankName}
				<select id="branch-select" class="select text-xl h-12 bg-rose-100" bind:value={selectedBranchId} disabled={!selectedBankName}>
					<option disabled selected value={undefined}>Select a branch...</option>
					{#each availableBranches as branch (branch.id)}
						<option value={branch.id}>{branch.branch}</option>
					{/each}
				</select>
		{/if}
	{/await}
