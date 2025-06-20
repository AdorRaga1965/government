<script lang="ts">
	import { sineOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { scale, fly } from 'svelte/transition'; // `fly` is used for the error message
	import type { User } from '$lib/types';
	import Comp_Icons from '$lib/components/Comp_Icons.svelte';

	let { user, startRect, onsuccess, onclose, onexitcomplete } = $props<{
		user: User;
		startRect: DOMRect;
		onsuccess: (user: User) => void;
		onclose: () => void;
		onexitcomplete: () => void;
	}>();

	let password = $state('');
	let hasError = $state(false);
	let isPasswordVisible = $state(false);
	let inputElement: HTMLInputElement;
	let targetAvatarElement: HTMLDivElement;

	let isEntering = $state(true);
	let isExiting = $state(false);
	let exitGhostRect: DOMRect | null = $state(null);
	// FIX: New state to control the modal shake animation for impactful feedback.
	let isShaking = $state(false);

	const position = tweened(
		{ top: startRect.top, left: startRect.left, width: startRect.width, height: startRect.height },
		{ duration: 600, easing: sineOut }
	);

	const displayName = $derived(user.fullname.replaceAll('|', ' '));
	const expectedPassword = $derived(user.fullname.split('|')[0].toLowerCase());

	$effect(() => {
		inputElement?.focus();
		const endRect = targetAvatarElement.getBoundingClientRect();
		position.set({ top: endRect.top, left: endRect.left, width: endRect.width, height: endRect.height });
		const unsub = position.subscribe((val) => {
			if (val.top === endRect.top) {
				isEntering = false;
				unsub();
			}
		});
	});

	function handleSubmit() {
		if (password.toLowerCase() !== expectedPassword) {
			hasError = true;
			// FIX: Trigger the shake animation on the entire modal.
			isShaking = true;
			// Reset the shake state after the animation completes.
			setTimeout(() => (isShaking = false), 500);
			return;
		}
		onsuccess(user);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onclose();
		if (event.key === 'Enter' && password) handleSubmit();
	}

	export function startExitAnimation() {
		exitGhostRect = targetAvatarElement.getBoundingClientRect();
		isExiting = true;
	}
</script>

<div
	class="hacker-bg fixed inset-0 z-50 flex items-center justify-center"
	onkeydown={handleKeydown}
	role="dialog"
	aria-modal="true"
	tabindex="-1"
>
	{#if isEntering}
		<div
			class="avatar fixed z-[60]"
			style:top={`${$position.top}px`}
			style:left={`${$position.left}px`}
			style:width={`${$position.width}px`}
			style:height={`${$position.height}px`}
		>
			<div class="w-full rounded-full">
				<img src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${user.fullname}`} alt="" />
			</div>
		</div>
	{/if}

	{#if isExiting && exitGhostRect}
		<div
			class="avatar fixed z-[60] animate-exit-zoom"
			style:top={`${exitGhostRect.top}px`}
			style:left={`${exitGhostRect.left}px`}
			style:width={`${exitGhostRect.width}px`}
			style:height={`${exitGhostRect.height}px`}
			onanimationend={onexitcomplete}
		>
			<div class="w-full rounded-full">
				<img src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${user.fullname}`} alt="" />
			</div>
		</div>
	{/if}

	<!-- The Main Modal - Now with shake animation -->
	<div
		class="card font-mono max-w-md w-full bg-[#1a202c]/90 text-gray-300 shadow-2xl shadow-green-500/10 m-4 border border-green-500/20 backdrop-blur-sm"
		class:animate-entry={!isEntering}
		class:animate-exit-fade={isExiting}
		class:animate-shake={isShaking}
	>
		<div class="card-body p-6 pt-8">
			<div class="flex flex-col items-center text-center">
				<div class="avatar placeholder mb-4" style:opacity={isEntering || isExiting ? 0 : 1}>
					<div
						bind:this={targetAvatarElement}
						class="w-16 h-16 rounded-full bg-green-400/10 text-green-400 ring ring-green-500/30 flex items-center justify-center"
					>
						<Comp_Icons name="lock" class="w-8 h-8" />
					</div>
				</div>
				<h3 class="text-2xl font-bold text-white">SYSTEM ACCESS</h3>
				<p class="font-semibold text-gray-400">
					TARGET: <span class="text-green-400 font-bold">{displayName}</span>
				</p>
			</div>

			<div class="w-full mt-4 flex flex-col items-center">
				<div class="relative w-full">
					<label
						class="flex w-full cursor-text items-center justify-center gap-2 overflow-hidden rounded-md border-2 border-green-900 bg-black/30 p-4 min-h-[4.5rem] transition-all focus-within:border-green-500"
						class:border-red-500={hasError}
						for="password-input"
					>
						{#each password.split('') as char, i (i)}
							<span
								class="text-3xl text-green-400"
								in:scale={{ duration: 150, start: 1.5, opacity: 0 }}
							>
								{isPasswordVisible ? char : '█'}
							</span>
						{/each}
						<span class="inline-block h-9 w-2 bg-green-400 animate-blink"></span>
					</label>
				</div>
				<input
					id="password-input"
					bind:this={inputElement}
					oninput={() => (hasError = false)}
					bind:value={password}
					class="sr-only"
					type="password"
				/>
				{#if hasError && !isExiting}
					<div
						class="flex items-center gap-2 mt-3 text-red-400 font-semibold"
						transition:fly={{ y: -10, duration: 200 }}
					>
						<Comp_Icons name="alert" class="w-5 h-5" />
						<span>ACCESS DENIED.</span>
					</div>
				{/if}
			</div>

			<div class="card-actions w-full flex-col-reverse sm:flex-row-reverse gap-2 mt-6">
				<button class="btn btn-success text-black w-full" onclick={handleSubmit}>AUTHENTICATE</button>
				<button class="btn btn-ghost text-gray-400 w-full" onclick={onclose}>ABORT</button>
			</div>
		</div>
	</div>
</div>

<style>
    @keyframes move-grid { from { background-position: 0 0; } to { background-position: -50px -50px; } }
    .hacker-bg {
        background-color: #111;
        background-image: linear-gradient(rgba(0, 255, 0, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 0, 0.07) 1px, transparent 1px);
        background-size: 50px 50px;
        animation: move-grid 2s linear infinite;
    }
    @keyframes entry-fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .animate-entry { animation: entry-fade-in 0.3s ease-out forwards; }

    @keyframes exit-fade-out { from { opacity: 1; } to { opacity: 0; } }
    .animate-exit-fade { animation: exit-fade-out 0.2s ease-in forwards; }

    @keyframes exit-zoom-avatar {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(8); }
    }
    .animate-exit-zoom { animation: exit-zoom-avatar 0.8s ease-in forwards; }
    @keyframes blink { 50% { opacity: 0; } }
    .animate-blink { animation: blink 0.8s infinite; }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    /* This class is now applied to the whole card for a much bigger impact. */
    .animate-shake { animation: shake 0.5s ease-in-out; }
</style>