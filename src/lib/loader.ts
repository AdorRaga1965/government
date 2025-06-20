import { graphine } from '$lib/api';
import { json, type ResponsePromise } from '@sveltejs/kit';

async function createListResponse(loader: (param: string) => Promise<any[]>, param: string): ResponsePromise {
	const items = await loader(param);
	return json({ items });
}

export async function loadPendingPersonaItems(persona: string): Promise<any[]> {
	const predicate = {
		e: 'vehicles.fn_pendingitems',
		w: `'${persona}'`
	};
	const pendingItems = await graphine('POST', predicate);
	return pendingItems || [];
}

export async function loadUsersByPersona(persona: string): Promise<any[]> {
	const userList = persona.toLowerCase() === 'purchase' ? 'buyers' : persona;
	const predicate = {
		e: 'vehicles.fn_user',
		l: '30',
		w: `'${userList}'`
	};
	const users = await graphine('POST', predicate);
	return users || [];
}

export async function loadFilipinoDetails(officerId: string): Promise<any | null> {
	const predicate = {
		e: 'vehicles.fn_filipinos',
		w: `'${officerId}','national_id'`
	};
	const results = await graphine('POST', predicate);
	return results?.[0] || null;
}

export function handlePersonaGET(persona: string): ResponsePromise {
	return createListResponse(loadPendingPersonaItems, persona);
}

export function handleUserGET(persona: string): ResponsePromise {
	return createListResponse(loadUsersByPersona, persona);
}