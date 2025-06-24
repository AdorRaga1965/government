<script lang="ts">
  import type { User } from '$lib/types';
  import Comp_Icons from './Comp_Icons.svelte';
  import Comp_Avatar from '$lib/components/Comp_Avatar.svelte'; // Import the Comp_Avatar component

  let { user, onlogout, isLoggingOut, onlogoutcomplete } = $props<{
    user: User;
    onlogout: () => void;
    isLoggingOut: boolean;
    onlogoutcomplete: () => void;
  }>();

  const fullAddress = $derived(
    [user.barrio_name, user.city_name, user.province_name].filter(Boolean).join(', ')
  );
  const activationDate = $derived(
    user.dt_activation
      ? new Date(user.dt_activation).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'N/A'
  );

  // Helper to map 'M'/'F' to 'Male'/'Female' for the Comp_Avatar component
  function mapGender(genderChar: string): 'Male' | 'Female' | 'Other' {
    return genderChar === 'M' ? 'Male' : genderChar === 'F' ? 'Female' : 'Other';
  }
</script>

<div
  class="card bg-base-100 shadow-xl animate-pop-in"
  class:animate-pop-out={isLoggingOut}
  onanimationend={() => {
    if (isLoggingOut) onlogoutcomplete();
  }}
>
  <div class="card-body flex-row items-center gap-4 px-4 py-1">
    <div class="avatar">
      <div class="w-24 rounded-full ring ring-success ring-offset-base-100 ring-offset-4">
        <!-- Replaced with the new Comp_Avatar component -->
        <Comp_Avatar
          displayName={user.fullname.replaceAll('|', ' ')}
          age={user.age}
          gender={mapGender(user.gender)}
        />
      </div>
    </div>
    <div class="flex-grow">
      <h3 class="text-2xl font-bold">{user.fullname.replaceAll('|', ' ')}</h3>
      <p class="text-base-content/70">ID: {user.officer_id || 'N/A'}</p>
      <p class="text-base-content/70"> Age: {user.age || 'N/A'} | Gender: {user.gender || 'N/A'} </p>
      <div class="text-base-content/70">Activated: {activationDate}</div>
    </div>
    <div class="ml-auto">
      <button class="btn btn-outline btn-error" onclick={onlogout} disabled={isLoggingOut}>
        <Comp_Icons name="logout" />
        Logout
      </button>
    </div>
  </div>
</div>

<style>
    @keyframes pop-in {
        from { opacity: 0; transform: scale(0.9) translateY(20px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-pop-in {
        animation: pop-in 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        animation-delay: 0.2s;
        opacity: 0;
    }

    @keyframes pop-out {
        from { opacity: 1; transform: scale(1) translateY(0); }
        to { opacity: 0; transform: scale(0.9) translateY(20px); }
    }
    .animate-pop-out {
        animation: pop-out 0.4s ease-out forwards;
    }
</style>
