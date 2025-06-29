<script lang="ts">
  import Comp_Banks from '$lib/Components/Comp_Banks.svelte';

  let { selectedBranchId = $bindable() } = $props<{
   selectedBranchId: number | undefined;
  }>();
</script>

<div class=" h-[280px] relative overflow-hidden rounded-lg bg-rose-200
            bg-cover bg-center"
     style="background-image: url('/img/loan.jpg');">
    <Comp_Banks bind:selectedBranchId />
</div>
