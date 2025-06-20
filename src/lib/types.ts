// Add 'purchase' to the union type.
export type Persona = 'notary' | 'insurance' | 'clearance' | 'registration' | 'purchase';

// Add 'purchase' to the validation array.
export const personas: Persona[] = ['notary', 'insurance', 'clearance', 'registration', 'purchase'];

// The User type remains the same.
export type User = {
	officer_id: string;
	fullname: string;
	role: string;
	barrio_name?: string;
	city_name?: string;
	province_name?: string;
	dt_activation?: string;
};