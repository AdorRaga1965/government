import { readable, type Readable } from 'svelte/store';

interface SseListenerHandle<T> {
  messages: Readable<T | null>;
  close: () => void;
}

export function SSE_Listen<T = any>(
  endpoint: string,
  params: Record<string, string>,
  onError?: (error: Event) => void
): SseListenerHandle<T> {
  const urlParams = new URLSearchParams(params);
  let eventSource: EventSource | null = null;

  const messages = readable<T | null>(null, (set) => {
    eventSource = new EventSource(`${endpoint}?${urlParams.toString()}`);

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        set(parsedData);
      } catch (err) {
        console.error('Error parsing SSE message:', err, event.data);
      }
    };

    eventSource.onerror = (event) => {
      if (onError) {
        onError(event);
      } else {
        console.error('SSE Error:', event);
      }
      eventSource?.close();
    };

    return () => {
      eventSource?.close();
      eventSource = null;
    };
  });

  return {
    messages,
    close: () => {
      eventSource?.close();
      eventSource = null;
    }
  };
}