<script lang="ts">
  import Input from "$lib/UI/Input.svelte";
  import Dropdown from "$lib/UI/Dropdown.svelte";
  import NameBirth from "$lib/components/NameBirth.svelte";
  import { graphine } from '$lib/services/Svc_Api';

  const inputElements = ["region", "province", "city", "barrio"];

  // let { selectedRegion="", selectedProvince="", selectedCity="", selectedBarrio="", selectedStreet="" } = $props<{
  //   selectedRegion:string, selectedProvince:string, selectedCity:string,
  //   selectedBarrio:string, selectedStreet:string }>();

  let {
    selectedRegion = $bindable(''),
    selectedProvince = $bindable(''),
    selectedCity = $bindable(''),
    selectedBarrio = $bindable(''),
    selectedStreet = $bindable(''),
    activeKeyboardValue = $bindable(''),
    currentInputElement = $bindable(''),
    selectedPlace = $bindable(""),
    showStreetAddress = $bindable(false),
          data = $bindable([]),
  } = $props();


  let barrio_code = "";
  let lastValue = "";

  let selectedDataMap: Record<string, string> = {
    region: "",
    province: "",
    city: "",
    barrio: "",
    street: ""
  };

  // Either reactive statement:
  let  showDD = $derived(!showStreetAddress && data.length > 0);

// OR with $derived (if data & showStreetAddress were stores):
// showDD = $derived([showStreetAddress, data], ([$showStreetAddress, $data]) => !$showStreetAddress && $data.length > 0);

  $effect(() => {
  if (selectedPlace !== null) {
    handlePlace();
  }});

  $effect(() => {
  // We only want this effect to run when `activeKeyboardValue` changes.
  // The 'if' condition remains the same inside the effect.
  if (activeKeyboardValue.length >= 2 && lastValue !== activeKeyboardValue) {
    // The logic inside is identical.
    const predicate = {
        e: "filipino.fn_addresssearch",
        l: 1000,
        w:  ` '${activeKeyboardValue}','${currentInputElement}' `
      };
    DropDown(predicate);
    lastValue = activeKeyboardValue;
  }
  });

 const areSublevelsDisabled = $derived(selectedProvince === "");
  async function DropDown(predicate: object) {
    console.log("predicate",predicate);
    data = await graphine("POST", predicate);
    data = data.filter((d) => d.place);
    console.log("data",data);
    if (data.length > 0) {
      showDD = true;
      setDDLocation();
    }
  }

  function setDDLocation() {
    const element = document.querySelector(`#${currentInputElement}`) as HTMLElement;
    if (element) {
      const { left, top, width, height } = element.getBoundingClientRect();
      const dropdown = document.querySelector(".dropdown-overlay");
      if (dropdown) {
        Object.assign(dropdown.style, {
          position: "absolute",
          left: `${left}px`,
          top: `${top + height}px`,
          width: `${width}px`
        });
      }
    }
  }

  function handlePlace() {
    const element = document.getElementById(currentInputElement) as HTMLInputElement;
    element.value = selectedPlace.split("|")[1];
    element.style.color = "Maroon";
    element.style.fontWeight = "bold";
    element.style.fontSize = "20px";
    activeKeyboardValue = "";
    const currentCode = selectedPlace.split("|")[0];
    selectedDataMap[currentInputElement] = selectedPlace;

    if (currentInputElement === "region") selectedRegion = element.value.split(",")[0];
    if (currentInputElement === "province") selectedProvince = element.value.split(",")[0];
    if (currentInputElement === "city") selectedCity = element.value.split(",")[0];
    if (currentInputElement === "barrio") selectedBarrio = element.value.split(",")[0];

    if (currentInputElement === "barrio") {
      showStreetAddress = true;
      barrio_code = selectedPlace.split("|")[0].split(",")[0];
      data = [];
      setTimeout(() => {
        document.getElementById("streetAddress")?.focus();
        document.getElementById("birthday-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return;
    } else {
      const parts = (currentCode.replaceAll(",", "|") + "|" + currentInputElement).split("|");
      const predicate = {
        e: "filipino.fn_addressFilter",
        l: 200,
        w: parts
      };
      console.log("predicate",predicate);
      DropDown(predicate);
      const nextElement = inputElements[inputElements.indexOf(currentInputElement) + 1];
      if (nextElement) currentInputElement = nextElement;
    }
  }
</script>
<!-- ✅ Layout -->
<div class="w-full bg-blue-200 shadow-2xl border-4 border-amber-100 rounded-2xl p-4 my-4">
<!--  <h1 class="text-xl font-semibold text-white">Address</h1>-->

  <!-- Collapsible Address Input Section -->
  <div class={`transition-all duration-500 ease-in-out overflow-hidden ${showStreetAddress ? 'max-h-0 opacity-0' : 'max-h-screen'}`}>
    <Input id="region" label="Region:" bind:value="{selectedRegion}" bind:keyboardValue="{activeKeyboardValue}" bind:inputID="{currentInputElement}" />
    <Input id="province" label="Province:" bind:value="{selectedProvince}" bind:keyboardValue="{activeKeyboardValue}" bind:inputID="{currentInputElement}" />
    <div class="{areSublevelsDisabled ? 'hidden':''}">
    <Input id="city" label="City/Municipality:" bind:value="{selectedCity}" bind:keyboardValue="{activeKeyboardValue}" bind:inputID="{currentInputElement}" />
    <Input id="barrio" label="Barrio:" bind:value="{selectedBarrio}" bind:keyboardValue="{activeKeyboardValue}" bind:inputID="{currentInputElement}" />
    </div>
  </div>

  <!-- Street Address & Birthday Section -->
  <div class={`${showStreetAddress ? '' : 'hidden'}`}>
    <div class="bg-zinc-800 text-white text-lg p-4 rounded-xl shadow-xl space-y-2">
      <div class="text-lg font-bold">
          <span
          contenteditable="true"
          class="editable-street"
          role="textbox"
          bind:textContent={selectedStreet}
          onkeydown={(e) => {
          if (e.key === 'Enter') {
              e.preventDefault(); // Prevents adding a new line
              e.currentTarget.blur(); // Un-focus the element
          }
          }}
          ></span>,
         {selectedBarrio}</div>
      <div>{selectedCity}, {selectedProvince}</div>
      <div class="text-sm text-gray-300">{selectedRegion}</div>


      <hr class="my-3 border-gray-600">

      <div id="birthday-section" class="pt-2">
        <NameBirth streetAddress={selectedStreet} barrio_code={barrio_code}  on:submitted />
      </div>
    </div>
  </div>

  <!-- Dropdown -->
  <Dropdown showDropdown={showDD} records={data} bind:selectedValue={selectedPlace}
  on:select={(e) => {
    selectedPlace = e.detail;
    handlePlace();
  }}
  />
</div>
<style>
  .section-container {
    background-color: #111827; /* Tailwind gray-900 */
    color: white;
    padding: 1rem;
    border-radius: 1rem;
  }

    .editable-street {
    /* Basic appearance */
    display: inline-block; /* Allows for min-width and padding */
    min-width: 50px; /* Minimum width to show the placeholder */
    padding: 0 2px;

    /* Inherit the look of the surrounding text */
    color: inherit;
    font: inherit;

    /* Visual cues that it's editable */
    outline: none;
    border-bottom: 1px dotted rgba(255, 255, 255, 0.4);
    transition: all 0.2s;
  }

  /* The CSS trick for a placeholder on an editable element */
  .editable-street:empty::before {
    content: 'Street';
    color: rgba(255, 255, 255, 0.4);
    cursor: text;
  }

  /* Make it obvious when editing */
  .editable-street:focus {
    border-bottom: 1px solid #f43f5e; /* Your theme's rose color */
    background-color: rgba(244, 63, 94, 0.1);
  }
</style>
