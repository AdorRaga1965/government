<script lang="ts">
  import type { User } from '$lib/types';
  import Comp_Avatar from '$lib/Components/Comp_Avatar.svelte';

  let { users, onselect } = $props<{
    users: User[];
    onselect: (user: User, rect: DOMRect) => void;
  }>();

  function handleSelect(user: User, target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return;
    const rect = target.getBoundingClientRect();
    onselect(user, rect);
  }

  // Helper to map 'M'/'F' to 'Male'/'Female' for the Comp_Avatar component
  function mapGender(genderChar: string): 'Male' | 'Female' | 'Other' {
    return genderChar === 'M' ? 'Male' : genderChar === 'F' ? 'Female' : 'Other';
  }
</script>

<div class="h-full">
  <div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
    {#each users as user (user.officer_id)}
      {@const displayName = user.fullname.replaceAll('|', ' ')}
      <button
        class="card group flex flex-col justify-center bg-base-100 items-center p-4 shadow-md
        		transition-all duration-600 hover:shadow-2xl hover:translate-y-4 hover:bg-base-400 focus:outline-none focus:ring-2 focus:ring-primary"
        onclick={(e) => handleSelect(user, e.currentTarget)}
        aria-label={`Select ${displayName}`}
      >
        <div class="avatar transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-30">
          <Comp_Avatar
            displayName={displayName}
            age={user.age}
            gender={mapGender(user.gender)}
          />
        </div>
        <div class="card-body items-center text-center py-2 px-1">
          <h3 class="font-bold text-base-content transition-colors group-hover:text-primary">
            {displayName}<hr>{user.age} yo {user.gender}
          </h3>
        </div>
      </button>
    {/each}
  </div>
</div>
