<script lang="ts">
	function assignSrc(src: string) {
		if(src=="roles") return document.getElementById("iframe")!.src = "/roles";
			document.getElementById("iframe")!.src =   src + ".html";
	}
</script>


<div class="bg-rose-600 w-full h-full sticky top-0 overflow-hidden">
			<button class="but-success"  onclick={() => assignSrc("My Profile")}>My Profile</button>
		  <button class="but-success"  onclick={() => assignSrc("Filipinus")}>Filipin.Us</button>
			<button class="but-warning"  onclick={() => assignSrc("Percentile Ranking")}>Percentile Ranking</button>
			<button class="but-warning"  onclick={() => assignSrc("Reference Notes")}>Reference Notes</button>
			<button class="but-warning" onclick={() => assignSrc("Status_Report 5_23")}>Status Report</button>
			<button class="but-warning"  onclick={() => assignSrc("Mastery, Performance, and Emotional Intensity")}>Emotional Intensity</button>
			<button class="but-warning"  onclick={() => assignSrc("roles")}>IT Roles</button>
			<button class="but-warning"  onclick={() => assignSrc("DPAS")}>DPAS</button>
			<button class="but-warning"  onclick={() => assignSrc("Account Registration")}>Account Registration</button>
	  	<button class="but-warning"  onclick={() => assignSrc("Mastering Database Architecture")}>Mastering Database Architecture</button>
			<button class="but-warning"  onclick={() => assignSrc("Vehicle Transactions Simulation")}>LTO Simulation</button>
			<button class="but-warning"  onclick={() => assignSrc("Graphine API Strategy")}>Graphine</button>
			<button class="but-warning"  onclick={() => assignSrc("Government")}>Government</button>
	<button class="but-warning"  onclick={() => assignSrc("National ID")}>National ID</button>
<button class="but-warning"  onclick={() => assignSrc("Vehicle Search")}>Vehicle Search</button>
<button class="but-warning"  onclick={() => assignSrc("Filipino Search")}>Filipino Search</button>
<button class="but-warning"  onclick={() => assignSrc("ContVehicles API")}>Vehicles API</button>
<button class="but-warning"  onclick={() => assignSrc("Vehicle AI Feedback")}>Vehicle AI Feedback</button>

<button class="but-warning"  onclick={() => assignSrc("Passwordless")}>National ID Isn't the Problem</button>
<button class="but-warning"  onclick={() => assignSrc("Mastering the lto Transactions")}>Mastering the LTO Transactions</button>
<button class="but-warning"  onclick={() => assignSrc("Database Design Session 6-11-2025")}>DB Design Session</button>
<button class="but-warning"  onclick={() => assignSrc("Brainwashing")}>Brainwashing</button>
<button class="but-warning"  onclick={() => assignSrc("splash")}>Splash</button>

<!--<button class="but-warning"  on:click={() => assignSrc("Cheat Sheet") }>Cheat Sheet</button>-->


</div>

<div class="w-full h-full flex">
	<iframe class=" w-full h-[800px] overflow-hidden scr " title="frameHolder" id="iframe"
					style="border: none;"></iframe>

</div>


<style>
	button {
			font-size: .8rem ;
			height: 22px;
			padding:2-2-2-2px;
			margin:0;
	}
</style>