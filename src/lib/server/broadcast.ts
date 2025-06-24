import { browser } from '$app/environment';
// The hub of connected clients.
const clients = new Map<string, { controller: ReadableStreamDefaultController; role: string }>();

export function addClient(controller: ReadableStreamDefaultController, role:string) {
    const clientId = crypto.randomUUID();
    clients.set(clientId, { controller, role });
    console.log(`[BROADCAST HUB] ✅ Client connected! Role: '${role}'. Total clients: ${clients.size}`);
    return clientId;
}

export function removeClient(clientId: string) {
    // A check to prevent errors if a client tries to disconnect twice.
    if (clients.has(clientId)) {
        clients.delete(clientId);
        console.log(`[BROADCAST HUB] ❌ Client disconnected. Total clients: ${clients.size}`);
    }
}

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