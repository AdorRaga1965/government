import { error, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
async function proxyFetch(
  url: string,
  options: RequestInit,
  fetchFn: typeof globalThis.fetch
): Promise<Response> {
  console.log(`[PROXY ${options.method}] ${url}`);
  try {
    return await fetchFn(url, options);
  } catch (e) {
    console.error(`[PROXY ERROR] ${options.method} ${url}:`, e);
    throw error(500, 'Backend service connection failed.');
  }
}
export const GET: RequestHandler = async ({ url, fetch }) => {
  const backendUrl = `${env.PRIVATE_PYTHON_BACKEND_URL}${url.search}`;
  return proxyFetch(backendUrl, { method: 'GET' }, fetch);
};
export const POST: RequestHandler = async ({ request, fetch }) => {
  const backendUrl = env.PRIVATE_PYTHON_BACKEND_URL;
  let requestBody: any;

  try {
    requestBody = await request.json();
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw error(400, 'Invalid JSON format in request body.');
    }
    throw e;
  }
  const options: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  };
  return proxyFetch(backendUrl, options, fetch);
};