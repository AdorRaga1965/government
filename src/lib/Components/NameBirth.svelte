<script lang="ts">
	 import { createEventDispatcher } from 'svelte';
	 import {graphine} from "$lib/api";
	// These props receive values from the parent (e.g., +page.svelte)
	
	interface Props {
		// and also allow the parent to bind back to them, updating the parent's state.
		firstName?: string;
		middleName?: string;
		lastName?: string;
		birthday?: string;
		placeOfBirth?: string; // New field
		gender?: string; // New field for select
		mobileNumber?: string; // New field
		emailAddress?: string; // New field
		streetAddress?: string;
		barrio_code?: string;
	}

	let {
		firstName = $bindable(''),
		middleName = $bindable(''),
		lastName = $bindable(''),
		birthday = $bindable(''),
		placeOfBirth = $bindable(''),
		gender = $bindable(''),
		mobileNumber = $bindable(''),
		emailAddress = $bindable(''),
		streetAddress = '',
		barrio_code = ''
	}: Props = $props();

 	const dispatch = createEventDispatcher();

	// Example gender options for the select dropdown
	const genderOptions = [
		{ value: '', label: 'Select Gender' }, // Placeholder option
		{ value: 'Male', label: 'Male' },
		{ value: 'Female', label: 'Female' },
		{ value: 'Other', label: 'Other' }
	];

	let allRequiredFieldsFilled =
    $derived(streetAddress.trim() !== '' &&
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    birthday !== '');


	async function saveToDB() {
	const fullRecord = {
      // Data from parent
      streetAddress: streetAddress.trim(),
      // Data from this component
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthday,
      middleName: middleName.trim(),
      placeOfBirth: placeOfBirth.trim(),
      gender,
      mobileNumber: mobileNumber.trim(),
      emailAddress: emailAddress.trim()
    };
	// const display = firstName.trim() + " " + lastName.trim();
	localStorage.setItem("userInfo", JSON.stringify(fullRecord));

	const fullname = firstName.trim() + "|" + middleName.trim() + "|" + lastName.trim();
	const street = streetAddress.trim();

	// 	SELECT filipino.sp_new(
	//     'Juan dela Cruz',        -- fullname
	//     '072217001',             -- barrio_code
	//     '123 Rizal Street',      -- street
	//     '1990-05-15'::DATE      -- date_birth
	// );
	const predicate = {
		e: "filipino.sp_new",
		w: `'${fullname}','${barrio_code}','${street}','${birthday}'`,
	}
	console.log("Predicate:", predicate.w);
	const data =  await graphine("post", predicate);
	console.log("Data:", data);
	localStorage.setItem("userDisplay",fullname + "  "  +  data[0]["sp_new"]);
  	dispatch('submitted');
  }

</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
	<label class="label">
		<span>First Name <span class="text-error-500">*</span></span>
		<input
			class="input"
			type="text"
			bind:value={firstName}
			placeholder="First Name"
			required
		/>
	</label>

	<label class="label">
		<span>Place of Birth</span>
		<input
			class="input"
			type="text"
			bind:value={placeOfBirth}
			placeholder="Place of Birth"
		/>
	</label>

	<label class="label">
		<span>Middle Name</span>
		<input
			class="input"
			type="text"
			bind:value={middleName}
			placeholder="Middle Name (optional)"
		/>
	</label>

	<label class="label">
		<span>Gender</span>
		<select
			class="select"
			bind:value={gender}
		>
			{#each genderOptions as option}
				<option value={option.value} disabled={option.value === ''} selected={option.value === ''}>
					{option.label}
				</option>
			{/each}
		</select>
	</label>

	<label class="label">
		<span>Last Name <span class="text-error-500">*</span></span>
		<input
			class="input"
			type="text"
			bind:value={lastName}
			placeholder="Last Name"
			required
		/>
	</label>

	<label class="label">
		<span>Mobile Number</span>
		<input
			class="input"
			type="tel" bind:value={mobileNumber}
			placeholder="Mobile Number"
		/>
	</label>

	<label class="label">
		<span>Birth Date <span class="text-error-500">*</span></span>
		<input
			class="input"
			type="date"
			bind:value={birthday}
			required
		/>
	</label>

	<label class="label">
		<span>Email Address</span>
		<input
			class="input"
			type="email" bind:value={emailAddress}
			placeholder="Email Address"
		/>
	</label>
	{#if allRequiredFieldsFilled}
  <div class="pt-6"> <!-- Added a bit more top padding for spacing -->
    <button onclick={saveToDB} class="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg">
      Submit
    </button>
  </div>
{/if}
</div>

<style>

</style>