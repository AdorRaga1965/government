<script lang="ts">
  import type { PageData } from './$types';
  import type { User } from '$lib/types';
  import { loadUsersByPersona } from '$lib/services/Svc_DB';
  import Comp_UsersList from '$lib/Components/Comp_UsersList.svelte';
  import Comp_Authentication from '$lib/Components/Comp_Authentication.svelte';
  import Comp_UserInfo from '$lib/Components/Comp_UserInfo.svelte';
  import Cont_PersonaItems from '$lib/Containers/Cont_PersonaItems.svelte';
  import Cont_PurchaseItem from '$lib/Containers/Cont_PurchaseItem.svelte';
  import CompInfoModal from '$lib/Components/Comp_InfoModal.svelte';

  let { data }: { data: PageData } = $props();
  let view: 'users' | '' = $state('users');
  let users = $state<User[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let selectedUser = $state<User | null>(null);
  let authenticatedUser = $state<User | null>(null);
  let isLoggingOut = $state(false);
  let startRect: DOMRect | null = $state(null);
  let isAuthExiting = $state(false);

  // New state for logout confirmation
  let showLogoutConfirm = $state(false);
  async function loadUsers() {
    isLoading = true;
    error = null;
    try {
      users = await loadUsersByPersona(data.persona);
    } catch (e: any) {
      error = e.message || 'Failed to load user data.';
    } finally {
      isLoading = false;
    }
  }

  function handleUserSelect(user: User, rect: DOMRect) {
    startRect = rect;
    selectedUser = user;
  }

  function handleAuthSuccess(loggedInUser: User) {
    authenticatedUser = loggedInUser;
    isAuthExiting = true;
  }

  async function handleAuthExitComplete() {
    selectedUser = null;
    startRect = null;
    isAuthExiting = false;
    view = '';
  }

  function handleAuthClose() {
    selectedUser = null;
    startRect = null;
  }

  function handleLogout() {
    showLogoutConfirm = true;
  }

  function cancelLogout() {
    showLogoutConfirm = false;
  }

  function confirmLogout() {
    showLogoutConfirm = false;
    isLoggingOut = true;
  }

  function handleLogoutComplete() {
    authenticatedUser = null;
    isLoggingOut = false;
    view = 'users';
    loadUsers();
  }

  loadUsers();
</script>

<div class="h-screen flex flex-col gap-6 p-4 sm:p-8 bg-base-200">
  {#if view === 'users'}
    <header class="flex-shrink-0 flex items-center justify-between">
      <h1 class="text-3xl font-bold font-spice capitalize">{data.persona} Services</h1>
    </header>
    <main class="card bg-base-100 shadow-xl flex-grow min-h-0">
        <div class="flex-grow min-h-0 overflow-y-auto max-h-[calc(100vh-200px)]">
            <Comp_UsersList {users} onselect={handleUserSelect} />
        </div>
    </main>
  {:else if authenticatedUser}
    <div class="flex-shrink-0">
      <Comp_UserInfo user={authenticatedUser} onlogout={handleLogout}
        isLoggingOut={isLoggingOut} onlogoutcomplete={handleLogoutComplete}
      />
    </div>

    <div class="flex-grow min-h-0 h-full card bg-base-100 items-center justify-center">
          {#if data.persona === 'purchase'}
              <Cont_PurchaseItem currentUser={authenticatedUser}/>
          {:else}
              <Cont_PersonaItems persona={data.persona} />
          {/if}
    </div>
  {/if}
</div>

{#if selectedUser && startRect}
  <Comp_Authentication
    user={selectedUser}
    {startRect}
    isExiting={isAuthExiting}
    onsuccess={handleAuthSuccess}
    onclose={handleAuthClose}
    onexitcomplete={handleAuthExitComplete}
  />
{/if}

<!-- Logout Confirmation Modal -->
{#if showLogoutConfirm}
  <CompInfoModal title="Confirm Logout" on:close={cancelLogout}>
  <p class="mb-4 text-sm text-gray-700 dark:text-gray-300">
    Are you sure you want to logout? Any unsaved progress will be lost.
  </p>
  <div class="flex justify-end gap-2 mt-6">
    <button class="btn btn-ghost" on:click={cancelLogout}>Cancel</button>
    <button class="btn btn-error" on:click={confirmLogout}>Logout</button>
  </div>
</CompInfoModal>

{/if}
