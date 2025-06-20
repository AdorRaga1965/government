// /lib/api.ts

/**
 * The definitive client-side helper for making API calls to your backend.
 * It acts as a universal interface for both GET and POST operations,
 * sending its instructions securely through a local SvelteKit API route.
 *
 * This file is the single source of truth for client-side data fetching.
 *
 * @param method The intended final HTTP method ('POST' or 'GET').
 * @param query For POST, an object. For GET, a URL-encoded string.
 * @returns A promise that resolves to the JSON data from the backend.
 */
export async function graphine(method: 'POST' | 'GET', query: string | object): Promise<any> {
    // The endpoint always points to our secure, local server proxy.
    // const endpoint = "/api/query/";
		const endpoint = "http://76.105.8.72:9191/query/";

    let fullUrl = endpoint;

    const requestOptions: RequestInit = {
        method: method.toUpperCase(),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    };

    // Construct the request based on the method
    if (method.toUpperCase() === 'POST') {
        requestOptions.body = JSON.stringify(query);
    } else { // GET
        if (typeof query !== 'string') {
            console.error("For GET requests, the 'query' parameter must be a URL-encoded string.");
            throw new Error("Invalid query type for GET request.");
        }
        fullUrl = `${endpoint}?${query}`;
    }

    try {
        const response = await fetch(fullUrl, requestOptions);
				if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error (${response.status}): ${errorText}`);
        }
        return response.json();
    } catch (error) {
        console.error("❌ Error in graphine helper:", error);
        // Re-throw the error so the calling component can handle it.
        throw error;
    }
}