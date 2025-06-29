<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition'; // Using fade for backdrop

  const dispatch = createEventDispatcher();

  export let title: string = 'Information';
  export let modalClasses: string = '';

  let modalContentElement: HTMLElement; // Reference to the modal content div
  let x = 0; // Current X pixel offset from the centered position
  let y = 0; // Current Y pixel offset from the centered position
  let isDragging = false; // Flag to indicate if the modal is being dragged
  let startPointerX = 0; // X coordinate of the mouse/touch when drag starts
  let startPointerY = 0; // Y coordinate of the mouse/touch when drag starts
  let startOffsetX = 0; // X offset of the modal when drag starts
  let startOffsetY = 0; // Y offset of the modal when drag starts

  let isReadyToShow = false; // State to control modal content visibility

  function handleClose() {
    dispatch('close');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }

  function startDrag(event: MouseEvent) {
    if (event.button !== 0 || !modalContentElement) return; // Only allow left-click
    isDragging = true;
    startPointerX = event.clientX;
    startPointerY = event.clientY;

    startOffsetX = x; // Capture the current pixel offset
    startOffsetY = y; // Capture the current pixel offset

    // Prevent text selection and change cursor while dragging
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  }

  function drag(event: MouseEvent) {
    if (!isDragging || !modalContentElement) return;

    const dx = event.clientX - startPointerX;
    const dy = event.clientY - startPointerY;

    // Calculate the new pixel offset
    let newX = startOffsetX + dx;
    let newY = startOffsetY + dy;

    // Optional: Constrain modal within viewport bounds
    const modalRect = modalContentElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate actual pixel top/left if it were not transformed from -50%,-50%
    // This is the absolute position of the top-left corner relative to viewport if transform was (0,0)
    const absoluteX = (viewportWidth / 2) - (modalRect.width / 2) + newX;
    const absoluteY = (viewportHeight / 2) - (modalRect.height / 2) + newY;

    // Apply constraints
    let constrainedX = newX;
    let constrainedY = newY;

    if (absoluteX < 0) {
      constrainedX = newX - absoluteX;
    } else if (absoluteX + modalRect.width > viewportWidth) {
      constrainedX = newX - (absoluteX + modalRect.width - viewportWidth);
    }

    if (absoluteY < 0) {
      constrainedY = newY - absoluteY;
    } else if (absoluteY + modalRect.height > viewportHeight) {
      constrainedY = newY - (absoluteY + modalRect.height - viewportHeight);
    }

    x = constrainedX;
    y = constrainedY;
  }

  function endDrag() {
    isDragging = false;
    // Reset body styles after dragging ends
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }

  onMount(() => {
    document.body.classList.add('modal-open-blur');
    window.addEventListener('keydown', handleKeydown);
    // Add global event listeners for dragging
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', endDrag);

    // Set isReadyToShow to true after a slight delay to allow rendering and CSS centering
    setTimeout(() => {
      isReadyToShow = true;
    }, 50);
  });

  onDestroy(() => {
    document.body.classList.remove('modal-open-blur');
    window.removeEventListener('keydown', handleKeydown);
    // Remove global event listeners for dragging
    window.removeEventListener('mousemove', drag);
    window.removeEventListener('mouseup', endDrag);
  });
</script>

<div class="modal-backdrop" transition:fade>
  {#if isReadyToShow}
  <div
    class="modal-content {modalClasses}"
    bind:this={modalContentElement}
    style="transform: translate(calc(-50% + {x}px), calc(-50% + {y}px));"
    on:click|stopPropagation
    transition:fade={{ duration: 150 }}
  >
    <div class="modal-header" on:mousedown={startDrag}>
      <div class="shady modal-title">{title}</div>
      <button class="close-button" on:click={handleClose} title="Close (Esc)">×</button>
    </div>
    <div class="modal-body">
      <slot />
    </div>
  </div>
  {/if}
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(15, 123, 142, 0.2);
    backdrop-filter: blur(0.3px);
    z-index: 1000;
    pointer-events: auto;
  }
  .modal-content {
    background: #ffffff;
    padding: 0;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(120, 10, 0, 0.2);
    width: 95vw;
    max-width: 600px; /* Or adjust to a suitable max-width */
    display: flex;
    flex-direction: column;
    max-height: 95vh;

    position: fixed; /* Crucial for top/left/transform positioning relative to viewport */
    top: 50%; /* Center point of the viewport */
    left: 50%; /* Center point of the viewport */
    /* Initial centering is now explicitly part of the transform style attribute in HTML,
       but is derived from CSS-like values for -50% and then pixel offsets from JS */
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    cursor: grab;
  }
  .modal-title {
    margin: 0;
		--font-weight-extrabold:;
    font-size: 2.0rem;
    font-weight: 900;
    color: mediumaquamarine;
    text-shadow: 2px 2px 4px rgba(20,20,40,0.5);
  }
  .modal-body {
    padding: 1.0rem;
    overflow-y: auto;
    flex-grow: 1;
  }
  .close-button {
    background: none;
    border: none;
    font-size: 3rem;
    line-height: 1;
    color: #9ca3af;
    cursor: pointer;
    transition: color 0.4s;
  }
  .close-button:hover {
    color: maroon;
    font-weight: 900;
  }
</style>

<svelte:head>
  <style>
    body.modal-open-blur > :not(.modal-backdrop) {
      filter: blur(1px);
      transition: filter 0.5s ease-in-out;
      pointer-events: none;
      user-select: none;
    }
  </style>
</svelte:head>
