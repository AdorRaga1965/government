import { browser } from '$app/environment';

export function dispatchBrowserEvent(name: string, detail?: object) {
  if (browser) {
    document.dispatchEvent(new CustomEvent(name, { detail }));
  }
}