import { error, type RequestHandler } from '@sveltejs/kit';
const PYTHON_BACKEND_URL = "http://76.105.8.72:9191/query/";

async function executeProxyFetch(
	url: string,
	options: RequestInit,
	fetch: typeof globalThis.fetch
): Promise<Response> {
	console.log(`[PROXY ${options.method}] Forwarding to: ${url}`);
	try {
		return await fetch(url, options);
	} catch (e) {
		console.error(`[PROXY ${options.method}] Error forwarding request:`, e);
		throw error(500, 'Could not connect to the backend service.');
	}
}

export const GET: RequestHandler = async ({ url, fetch }) => {
	const backendEndpoint = `${PYTHON_BACKEND_URL}${url.search}`;
	const options: RequestInit = { method: 'GET' };
	return executeProxyFetch(backendEndpoint, options, fetch);
};

export const POST: RequestHandler = async ({ request, fetch }) => {
	const backendEndpoint = PYTHON_BACKEND_URL;
	try {
		const requestBody = await request.json();
		const options: RequestInit = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody)
		};
		return executeProxyFetch(backendEndpoint, options, fetch);
	} catch (e) {
		if (e instanceof SyntaxError) {
			console.error(`[PROXY POST] Invalid JSON body:`, e);
			throw error(400, 'Invalid JSON format in request body.');
		}
		throw e;
	}
};