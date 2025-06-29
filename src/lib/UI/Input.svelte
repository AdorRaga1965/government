<script lang="ts">
  import { run } from 'svelte/legacy';

  let {
    id = '',
    label = '',
    type = 'text',
    value = $bindable(''),
    keyboardValue = $bindable(''),
    inputID = $bindable(''),
    prefix = 'Select '
  } = $props<{
    id?: string;
    label?: string;
    type?: string;
    value?: string;
    keyboardValue?: string;
    inputID?: string;
    prefix?: string;
  }>();

  // Optional dynamic prefix
  run(() => {
    if (prefix?.startsWith('Select') && label) {
      prefix = `Select ${label.replace(':', '').toLowerCase()}`;
    }
  });
</script>

<div class="field">
  {#if label}
    <label for={id}>{label}</label>
  {/if}

  <input
    id={id}
    class="input bg-zinc-200 w-full outline outline-2 outline-white shadow hover:outline-amber-200"
    type={type}
    placeholder={`⌨ ${prefix}`}
    bind:value={value}
    on:input={(e) => {
      keyboardValue = e.target.value;
      inputID = e.target.id;
    }}
  />
</div>

<style>
  .field {
    margin-bottom: 0.75rem;
  }

  label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 600;
  }

  .input {
    width: 100%;
    padding: 0.5rem;
    border-radius: 0.5rem;
    font-size: 1rem;
  }
</style>
