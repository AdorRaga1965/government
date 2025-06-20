import { error } from '@sveltejs/kit';
import { personas } from '$lib/types';
import type { PageServerLoad } from './$types';
import type { Persona } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
	const normalizedPersona = params.persona.toLowerCase() as Persona;

	if (!personas.includes(normalizedPersona)) {
		throw error(404, 'Not Found');
	}

	return {
		persona: normalizedPersona
	};
};