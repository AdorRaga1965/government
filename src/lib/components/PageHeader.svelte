<script lang="ts">
  import { createBubbler, stopPropagation } from 'svelte/legacy';

  const bubble = createBubbler();
  import { currentUser, logout } from '$lib/stores/authStore';
  import { fade } from 'svelte/transition';

  interface Props {
    departmentName?: string;
  }

  let { departmentName = '' }: Props = $props();

  let showLogoutConfirm = $state(false);

  function handleLogout() {
    logout();
    // --- THE BUG FIX: Manually close the modal after logout ---
    showLogoutConfirm = false;
  }
</script>

<div class="stick text-center mt-2">

<div class="shady text-3xl text-teal-200 bg-indigo-300 rounded font-extrabold">{departmentName.toUpperCase()}</div>
<!-- The overall structure is now much cleaner to support the desired layout -->
   {#if $currentUser}
<header class="page-header my-0 text-left">
    <div class="user-info justify-content-center w-full m-0 py-0">
      <div class="user-details">
        <strong class="user-name font-extrabold">{$currentUser.name}</strong>
        <span class="user-role">{$currentUser.nationalId},{$currentUser.role}</span>
				<button class="logout-trigger" onclick={() => showLogoutConfirm = true}>Logout</button>
      </div>
      <img src="https://testingbot.com/free-online-tools/random-avatar/64?u={$currentUser.nationalId}u{$currentUser.name}" alt="User Avatar" class="avatar" />

    </div>
</header>
  {/if}
</div>

<!-- Logout Confirmation Modal -->
{#if showLogoutConfirm}
  <div class="modal-overlay" onclick={() => showLogoutConfirm = false} transition:fade={{ duration: 150 }}>
    <div class="modal-content" onclick={stopPropagation(bubble('click'))} transition:fade={{ duration: 150, start: 0.5, y: -20 }}>
      <h3>Confirm Logout</h3>
      <p>Are you sure you want to log out of this session?</p>
      <div class="modal-actions">
        <button class="button-secondary" onclick={() => showLogoutConfirm = false}>Cancel</button>
        <button class="button-danger" onclick={handleLogout}>Yes, Logout</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start; /* Align to the top for a cleaner look */
    padding: 1.5rem;
    background-color: #f8fafc; /* Lighter, cleaner background */
    border-bottom: 1px solid #e2e8f0;
  }
  .department-name {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  /* User Info Styles - Reworked for the screenshot's layout */
  .user-info { display: flex; align-items: center; gap: 0.75rem; }
  .user-details { text-align: right; }
  .avatar { width: 40px; height: 40px; border-radius: 50%; }
  .user-name {
    display: block; line-height: 1.2;
    font-weight: 600; color: #1e293b; /* Good contrast */
  }
  .user-role { font-size: 0.8rem; color: #64748b; } /* Subdued color for role */

  .logout-trigger {
    background: none; border: none; font-weight: 500;
    cursor: pointer; padding: 0; margin-left: 0.5rem;
    color: #3b82f6; /* Contrasting blue */
  }
  .logout-trigger:hover { text-decoration: underline; }

  /* Modal Styles (Unchanged but confirmed good) */
  .modal-overlay { /* ... */ }
  .modal-content { /* ... */ }
  .modal-actions { /* ... */ }
  .button-secondary, .button-danger { /* ... */ }
</style>