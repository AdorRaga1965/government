<script lang="ts">
  import { run } from 'svelte/legacy';

  
  interface Props {
    label: string;
    type?: string;
    options?: { value: string; label: string }[];
    selectedValue?: string;
    placeholder?: string;
    // export let step = 1;
    errorMessage?: string;
  }

  let {
    label,
    type = "text",
    options = [],
    selectedValue = $bindable(""),
    placeholder = "",
    errorMessage = $bindable("")
  }: Props = $props();
  let isDisabled = $state(false);
  run(() => {
    selectedValue;
  });

  function handleChange(event: any) {
    selectedValue = event.target.value;
    validateField();
  }

  function validateField() {
    if (type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      errorMessage = emailRegex.test(selectedValue) ? "" : "❌ Invalid email format";
    } else if (type === "currency") {
      selectedValue = selectedValue.replace(/[^0-9.]/g, "");
      errorMessage = isNaN(parseFloat(selectedValue)) ? "❌ Invalid currency value" : "";
    }
    isDisabled = errorMessage !== "";
  }

  function formatCurrency() {
    if (selectedValue) {
      selectedValue = parseFloat(selectedValue).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
</script>

<style>

</style>

<!-- 🚀 Accessible Form Field Component -->
<div class="field">
  <label for={label} aria-label={label}>{label}</label>

  {#if type === "select"}
    <select id={label} class="input" bind:value={selectedValue} onchange={handleChange} disabled={isDisabled}>
      <option value="" disabled selected={!selectedValue}>{placeholder}</option>
      {#each options as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  {:else}
    <input
      {type}
      id={label}
      class="input"
      {placeholder}
      bind:value={selectedValue}
      oninput={handleChange}
      disabled={isDisabled}
    />
  {/if}

  {#if errorMessage}
    <p class="error-message">{errorMessage}</p>
  {/if}
</div>
