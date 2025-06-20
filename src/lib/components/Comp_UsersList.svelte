<script lang="ts">
	import type { User } from '$lib/types';

	let { users, onselect } = $props<{
		users: User[];
		onselect: (user: User, rect: DOMRect) => void;
	}>();

	// A clean helper function to handle the click logic.
	function handleSelect(user: User, target: EventTarget | null) {
		if (!(target instanceof HTMLElement)) return;
		const rect = target.getBoundingClientRect();
		onselect(user, rect);
	}
</script>

<div class="h-full">
	<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
		{#each users as user (user.officer_id)}
			{@const displayName = user.fullname.replaceAll('|', ' ')}
			<button
				class="card group flex flex-col justify-center bg-base-200 items-center p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-base-300 focus:outline-none focus:ring-2 focus:ring-primary"
				onclick={(e) => handleSelect(user, e.currentTarget)}
				aria-label={`Select ${displayName}`}
			>
				<div class="avatar">
					<div
						class="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:ring-secondary"
					>
						<img
							src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${user.fullname}`}
							alt=""
							aria-hidden="true"
						/>
					</div>
				</div>
				<!-- Adjusted padding for better vertical alignment. -->
				<div class="card-body items-center text-center py-2 px-1">
					<h3 class="font-bold text-base-content transition-colors group-hover:text-primary">
						{displayName}
					</h3>
				</div>
			</button>
		{/each}
	</div>
</div>