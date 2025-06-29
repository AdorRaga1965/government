import { browser } from '$app/environment';

const clients = new Map<string, { controller: ReadableStreamDefaultController; role: string }>();

export function addClient(controller: ReadableStreamDefaultController, role: string) {
	const clientId = crypto.randomUUID();
	clients.set(clientId, { controller, role });
	console.log(`[BROADCAST HUB] ✅ Client connected! Role: '${role}'. Total clients: ${clients.size}`);
	return clientId;
}

export function removeClient(clientId: string) {
	if (clients.has(clientId)) {
		clients.delete(clientId);
		console.log(`[BROADCAST HUB] ❌ Client disconnected. Total clients: ${clients.size}`);
	}
}

export function notifyRoles(roles: string[], data: any, source: string = 'unknown') {
	if (browser) return;
	const normalizedRoles = roles.map(role => role.toLowerCase());
	console.log(`[NOTIFY] 🔔 Source: ${source} → Roles: [${normalizedRoles.join(', ')}]`);
	const message = `data: ${JSON.stringify(data)}\n\n`;
	for (const [clientId, client] of clients.entries()) {
		if (normalizedRoles.includes(client.role)) {
			console.log(`[NOTIFY] ✅ Matched role: ${client.role} (ID: ${clientId}) — notifying...`);
			client.controller.enqueue(message);
		}
	}
}
