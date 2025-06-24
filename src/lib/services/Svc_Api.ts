import { browser } from '$app/environment';
const cache = new Map<string, Promise<any>>();
function createApiMessage(query: any): string {
	if (query?.e) {
		const endpoint = query.e.split('.').pop();
		console.log('Endpoint:', endpoint);
		if (endpoint.includes('search_options')) return 'Loading Filters...';
		if (endpoint.includes('vw_')) return `Loading ${endpoint.replace('vw_', '')}...`;
		if (endpoint.includes('inventory')) return 'Searching Inventory...';
		if (endpoint.includes('population')) return 'Searching Population...';
		if (endpoint.includes('Banks')) return 'Loading Banks...';
		if (endpoint.includes('fn_user')) return 'Loading Users...';
		if (endpoint.includes('fn_pendingitems')) return `Loading Items for ${query.w.replace(/'/g, '')}...`;
	}
	return 'Processing Request...';
}
function dispatchBrowserEvent(name: string, detail?: object) {
	// DEFINITIVE FIX: This check prevents server-side crashes.
	if (browser) {
		document.dispatchEvent(new CustomEvent(name, { detail }));
	}
}

export function graphine(method: 'post' | 'get', query: string | object): Promise<any> {
	const cacheKey = JSON.stringify({ method, query });

	if (cache.has(cacheKey)) {
		console.log('[CACHE] ✅ HIT! Returning cached promise for key:', cacheKey);
		dispatchBrowserEvent('apirequest:cachehit', { message: 'Loaded from Cache' });
		return cache.get(cacheKey)!;
	}
	console.log('[CACHE] ❌ MISS! Creating new network request for key:', cacheKey);
	const message = createApiMessage(query);
	dispatchBrowserEvent('apirequest:start', { detail: { message } });

	const promise = (async () => {
		try {
			// When running on the server, `fetch` automatically handles the full URL.
			// When on the client, it uses the relative path to our proxy.
			const endpoint = '/api/query/';
			let fullUrl = endpoint;
			const requestOptions: RequestInit = {
				method: method.toUpperCase(),
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json'
				}
			};

			if (method.toUpperCase() === 'POST') {
				requestOptions.body = JSON.stringify(query);
			} else {
				if (typeof query !== 'string') {
					throw new Error('Invalid query type for GET request.');
				}
				fullUrl = `${endpoint}?${query}`;
			}

			const response = await fetch(fullUrl, requestOptions);
			if (!response.ok) {
				throw new Error(`API Error (${response.status}): ${await response.text()}`);
			}

			const data = await response.json();
			dispatchBrowserEvent('apirequest:end', { detail: { success: true } });
			return data;
		} catch (error) {
			console.error('❌ Error in graphine helper:', error);
			dispatchBrowserEvent('apirequest:end', { detail: { success: false } });
			throw error;
		}
	})();

	promise.catch(() => {
		cache.delete(cacheKey);
	});
	cache.set(cacheKey, promise);

	return promise;
}

export function clearCacheEntry(method: 'post' | 'get', query: string | object) {
	const cacheKey = JSON.stringify({ method, query });
	if (cache.has(cacheKey)) {
		cache.delete(cacheKey);
		console.log(`[CACHE] 💥 Cleared cache for key: ${cacheKey}`);
	}
}