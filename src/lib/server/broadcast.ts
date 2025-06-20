// This file can be imported by any other server-side code.
import { browser } from '$app/environment';

/*=======================================================================================
██████╗ ██████╗      ██████╗ ██╗   ██╗███████╗██████╗ ██╗   ██╗
██╔══██╗██╔══██╗    ██╔═══██╗██║   ██║██╔════╝██╔══██╗╚██╗ ██╔╝
██║  ██║██████╔╝    ██║   ██║██║   ██║█████╗  ██████╔╝ ╚████╔╝
██║  ██║██╔══██╗    ██║▄▄ ██║██║   ██║██╔══╝  ██╔══██╗  ╚██╔╝
██████╔╝██████╔╝    ╚██████╔╝╚██████╔╝███████╗██║  ██║   ██║
╚═════╝ ╚═════╝      ╚══▀▀═╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝

WHAT TO DO: PRODUCTION-READY REAL-TIME (Optional but Important)
This entire file currently operates "in-memory". The `clients` Map only exists as
long as your server process is running. If the server restarts, all active
connections are lost. This is perfectly fine for a simulation or single-server setup.

For a highly scalable, multi-server production environment, you would replace this
in-memory Map with a more robust message broker like Redis Pub/Sub.

HOW IT WOULD WORK WITH REDIS:
1. `addClient`: Instead of adding to a Map, the server would `SUBSCRIBE` to a
   Redis channel specific to its role (e.g., `SUBSCRIBE role:notary`).
2. `broadcastToRoles`: Instead of looping through a Map, the server would `PUBLISH`
   a message to the relevant Redis channels (e.g., `PUBLISH role:notary '...'`).
3. Redis then handles distributing the message to all subscribed server instances,
   which in turn forward it to their connected browser clients via SSE.

This file does not contain direct DB interactions (INSERT/UPDATE/QUERY), but it's
the core of your "TRANSMIT" logic.
==========================================================================================*/

// The hub of connected clients.
const clients = new Map<string, { controller: ReadableStreamDefaultController; role: string }>();

/**
 * Adds a new client to the broadcast hub.
 * This will be called by our SSE endpoint.
 * @returns A unique ID for the new client.
 */
export function addClient(controller: ReadableStreamDefaultController, role:string) {
    const clientId = crypto.randomUUID();
    clients.set(clientId, { controller, role });
    console.log(`[BROADCAST HUB] ✅ Client connected! Role: '${role}'. Total clients: ${clients.size}`);
    return clientId;
}

/**
 * Removes a client from the hub.
 */
export function removeClient(clientId: string) {
    // A check to prevent errors if a client tries to disconnect twice.
    if (clients.has(clientId)) {
        clients.delete(clientId);
        console.log(`[BROADCAST HUB] ❌ Client disconnected. Total clients: ${clients.size}`);
    }
}

/**
 * Broadcasts a message only to clients with specific roles.
 * This is the function our server actions will call.
 */
export function broadcastToRoles(roles: string[], data: any) {
    if (browser) return; // Should always be false here, but good practice.

    console.log(`[BROADCAST] Attempting to send to roles: [${roles.join(', ')}]. Total clients connected: ${clients.size}`);

    const message = `data: ${JSON.stringify(data)}\n\n`;

    for (const [clientId, client] of clients.entries()) {
        if (roles.includes(client.role)) {
            console.log(`[BROADCAST] ✅ Found match! Sending message to role: ${client.role} (ID: ${clientId})`);
            client.controller.enqueue(message);
        }
    }
}