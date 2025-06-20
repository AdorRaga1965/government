import type { RequestHandler } from './$types';
import { addClient, removeClient } from '$lib/server/broadcast';


export const GET: RequestHandler = ({ url }) => {
    const role = url.searchParams.get('role');
    if (!role) {
        return new Response('Role parameter is required.', { status: 400 });
    }
    let clientId: string;
    const stream = new ReadableStream({
        start(controller) {
            try {
                clientId = addClient(controller, role);
                controller.enqueue(`data: ${JSON.stringify({ type: 'connected', role })}\n\n`);
            } catch (err) {
                console.error('Error in stream start:', err);
                controller.error(err);
            }
        },
        cancel() {
            try {
                if (clientId) {
                    removeClient(clientId);
                }
            } catch (err) {
                console.error('Error in stream cancel:', err);
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
