<script lang="ts">
  import { sineOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import { scale, fly } from 'svelte/transition';
  import type { User } from '$lib/types';
  import Comp_Icons from '$lib/components/Comp_Icons.svelte';
  import Comp_Avatar from '$lib/components/Comp_Avatar.svelte';

  let { user, startRect, isExiting, onsuccess, onclose, onexitcomplete } = $props<{
    user: User;
    startRect: DOMRect;
    isExiting: boolean;
    onsuccess: (user: User) => void;
    onclose: () => void;
    onexitcomplete: () => void;
  }>();

  let password = $state('');
  let hasError = $state(false);
  let isPasswordVisible = $state(false);
  let inputElement: HTMLInputElement;
  let targetAvatarElement: HTMLDivElement;
  let canvasElement: HTMLCanvasElement;

  let isEntering = $state(true);
  let exitGhostRect: DOMRect | null = $state(null);
  let isShaking = $state(false);

  const position = tweened(
    { top: startRect.top, left: startRect.left, width: startRect.width, height: startRect.height, rotation: 0 },
    { duration: 600, easing: sineOut }
  );

  const displayName = $derived(user.fullname.replaceAll('|', ' '));
  const expectedPassword = $derived(user.fullname.split('|')[0].toLowerCase());

  function mapGender(genderChar: string): 'Male' | 'Female' | 'Other' {
    return genderChar === 'M' ? 'Male' : genderChar === 'F' ? 'Female' : 'Other';
  }

  $effect(() => {
    const canvas = canvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    setupCanvas();
    const cols = Math.floor(canvas.clientWidth / 20) + 1;
    const ypos = Array(cols).fill(0);
    const matrix = () => {
      // Reverted to original green-colored matrix background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Semi-transparent black for trailing effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0f0'; // Bright green for characters
      ctx.font = '15pt monospace';
      ypos.forEach((y, ind) => {
        const text = String.fromCharCode(Math.random() * 128);
        const x = ind * 20;
        ctx.fillText(text, x, y);
        if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
        else ypos[ind] = y + 20;
      });
      animationFrameId = requestAnimationFrame(matrix);
    };
    matrix();
    window.addEventListener('resize', setupCanvas);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setupCanvas);
    };
  });

  $effect(() => {
    inputElement?.focus();
    const endRect = targetAvatarElement.getBoundingClientRect();
    position.set({
      top: endRect.top,
      left: endRect.left,
      width: endRect.width,
      height: endRect.height,
      rotation: 360 * 2 // Rotate two full turns (720 degrees) during entry
    });
    const unsub = position.subscribe((val) => {
      if (val.top === endRect.top) {
        isEntering = false;
        unsub();
      }
    });
  });

  $effect(() => {
    if (isExiting) {
      exitGhostRect = targetAvatarElement.getBoundingClientRect();
    }
  });

  function handleSubmit() {
    if (password.toLowerCase() !== expectedPassword) {
      hasError = true;
      isShaking = true;
      setTimeout(() => (isShaking = false), 500);
      return;
    }
    onsuccess(user);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') onclose();
    if (event.key === 'Enter' && password) handleSubmit();
  }

  function handleAbortClick() {
    setTimeout(() => {
      onclose();
    }, 100); // 100ms delay, adjust as needed
  }
</script>

<div onkeydown={handleKeydown} role="dialog" aria-modal="true" tabindex="-1">
  <canvas
    bind:this={canvasElement}
    class="fixed inset-0 z-40 w-full h-full"
    aria-hidden="true"
  ></canvas>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    {#if isEntering}
      <div
        class="avatar fixed z-[60] w-16 h-16"
        style:top={`${$position.top}px`}
        style:left={`${$position.left}px`}
        style:width={`${$position.width}px`}
        style:height={`${$position.height}px`}
        style:transform={`translate(-50%, -50%) rotate(${$position.rotation}deg)`}
      >
        <Comp_Avatar
          displayName={displayName}
          age={user.age}
          gender={mapGender(user.gender)}
        />
      </div>
    {/if}

    {#if isExiting && exitGhostRect}
      <div
        class="avatar fixed z-[60] animate-exit-zoom w-16 h-16"
        style:top={`${exitGhostRect.top}px`}
        style:left={`${exitGhostRect.left}px`}
        style:width={`${exitGhostRect.width}px`}
        style:height={`${exitGhostRect.height}px`}
        onanimationend={onexitcomplete}
      >
        <Comp_Avatar
          displayName={displayName}
          age={user.age}
          gender={mapGender(user.gender)}
        />
      </div>
    {/if}

    <div
      class="card font-mono max-w-md w-full bg-[#10151c]/80 text-gray-300 shadow-2xl shadow-green-500/10 m-4 border border-green-500/20"
      class:animate-entry={!isEntering}
      class:animate-exit-fade={isExiting}
      class:animate-shake={isShaking}
    >
      <div class="card-body p-6 pt-8">
        <div class="flex flex-col items-center text-center">
          <div class="avatar placeholder mb-4" style:opacity={isEntering || isExiting ? 0 : 1}>
            <div
              bind:this={targetAvatarElement}
              class="w-32 h-32 rounded-full bg-rose-400/10 text-rose-400 ring ring-green-500/30 flex items-center justify-center"
            >
              <Comp_Avatar
                displayName={displayName}
                age={user.age}
                gender={mapGender(user.gender)}
              />
            </div>
          </div>
          <h3 class="text-3xl font-thin">SYSTEM ACCESS</h3>
          <p class="font-semibold text-gray-400">
            TARGET: <span class="text-amber-200 font-extrabold">{displayName}</span>
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
                  class="text-5xl text-green-300"
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
          <button class="btn btn-ghost text-gray-400 w-full" onclick={handleAbortClick}>ABORT</button>
        </div>
      </div>
    </div>
  </div>
</div>





<style>
    @keyframes entry-fade-in { from { opacity: 0; transform: scale(0.65); } to
                                    { opacity: 1; transform: scale(1); } }
    .animate-entry { animation: entry-fade-in 1s ease-out forwards; }
    @keyframes exit-fade-out { from { opacity: 1; } to { opacity: 0; } }
    .animate-exit-fade { animation: exit-fade-out 0.6s ease-in forwards; }
    @keyframes exit-zoom-avatar {
        from { opacity: 1; transform: scale(1.4) rotate(0deg); }
        to { opacity: 0; transform: scale(10) rotate(360deg); } /* Rotates 360 degrees on exit */
    }
    .animate-exit-zoom { animation: exit-zoom-avatar 0.8s ease-in forwards; }
    @keyframes blink { 50% { opacity: 0; } }
    .animate-blink { animation: blink 0.8s infinite; }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    .animate-shake { animation: shake 0.5s ease-in-out; }
</style>
