import { json, fail } from '@sveltejs/kit';
import * as dynamo from '$lib/server/broadcast';
export const GET = ({ url }) => {
  const role = url.searchParams.get('role');
  if (!role) {
    return new Response('Role parameter is required.', { status: 400 });
  }
  let clientId: string;
  const stream = new ReadableStream({
    start(controller) {
      try {
        clientId = dynamo.addClient(controller, role);
        controller.enqueue(`data: ${JSON.stringify({ type: 'connected', role })}\n\n`);
      } catch (err) {
        console.error('[SSE GET] Stream start error:', err);
        controller.error(err);
      }
    },
    cancel() {
      try {
        if (clientId) {
          dynamo.removeClient(clientId);
        }
      } catch (err) {
        console.error('[SSE GET] Stream cancel error:', err);
      }
    }
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
};
export const POST = async ({ request }) => {
  try {
    const body = await request.json();

    if (!body || typeof body !== 'object' || !('notify' in body)) {
      return fail(400, { success: false, message: 'Request body must contain a "notify" object.' });
    }
    const { notify } = body;
    const { method, payload, roles = [], tag = 'generic' } = notify;

    if (!method || typeof method !== 'string') {
      return fail(400, { success: false, message: 'Missing or invalid "method" in notify payload.' });
    }
    if (!Array.isArray(roles)) {
      return fail(400, { success: false, message: '"roles" in notify payload must be an array.' });
    }

    const broadcastFunction = dynamo[method as keyof typeof dynamo];

    if (typeof broadcastFunction !== 'function') {
      return fail(400, { success: false, message: `Broadcast method '${method}' not found or is not a function.` });
    }

    await broadcastFunction(roles.map((r: string) => r.toLowerCase()), payload, tag);

    return json({ success: true });
  } catch (err: any) {
    if (err instanceof SyntaxError) {
      console.error('[SSE POST] Invalid JSON body:', err);
      return fail(400, { success: false, message: 'Invalid JSON format in request body.' });
    }
    console.error('[SSE POST] Unexpected server error:', err);
    return fail(500, {
      success: false,
      message: err?.message || 'An unexpected server error occurred.'
    });
  }
};