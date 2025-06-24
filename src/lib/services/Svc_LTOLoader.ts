import { graphine } from '$lib/services/Svc_Api';
import type {  User, Persona_Record } from '$lib/types';

/**
 * Loads the list of banks. The caching is handled by `graphine`.
 */
export function loadBanks(): Promise<Bank[]> {
	const predicate = { e: 'Finance.Banks' };
	return graphine('post', predicate);
}

/**
 * Loads a list of users based on their persona role.
 * @param persona The role of the users to load.
 */
export async function loadUsersByPersona(persona: string): Promise<User[]> {
	// DEFINITIVE FIX: The persona 'purchase' must be translated to 'buyers'
	// for the backend function to work correctly. This logic is now restored.
	const userList = persona.toLowerCase() === 'purchase' ? 'buyers' : persona;

	const predicate = {
		e: 'vehicles.fn_user',
		l: '40',
		w: `'${userList}'`
	};
	return await graphine('post', predicate);
}

/**
 * Loads the list of pending tasks for a given persona.
 * @param persona The role to fetch tasks for.
 */
export async function loadPendingPersonaItems(persona: string): Promise<Persona_Record[]> {
	let x = capFirst(persona) ;
	console.log("===============================>",    x);
	const predicate = {
		e: 'vehicles.fn_pendingitems',
		w: `'${x}'`
	};
	return await graphine('post', predicate);
}

export async function loadPersonaItem(id: string): Promise<Persona_Record[]> {
	const predicate = {
		e: 'vehicles.fn_360view',
		w: `'${id}'`
	};
	return await graphine('post', predicate);
}

function capFirst(str) {
  if (!str) return ''; // Handle empty or null strings
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}