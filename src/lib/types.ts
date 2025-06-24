// Defines the valid roles for different user personas.
export type Persona = 'notary' | 'insurance' | 'clearance' | 'registration' | 'purchase' | 'legal' | 'accounting' | 'records' | 'release';

// An array for validating persona strings.
export const personas: Persona[] = ['notary', 'insurance', 'clearance', 'registration', 'purchase', 'legal', 'accounting', 'records', 'release'];

// Defines the structure of a user object.
export type User = {
	officer_id: string;
	fullname: string;
	role: string;
	barrio_name?: string;
	city_name?: string;
	province_name?: string;
	dt_activation?: string;
	gender?: string;
	age?: number;
};

// Defines the structure for a vehicle purchase transaction, used as a "task".
export type Purchase_Record = {
	purchase_id: string;
	vin: string;
	owner_national_id: string;
	purchase_value: number;
	purchase_type: 'cash' | 'loan';
	dt_purchase: string;
	source: string;
	status: string;
};


export type Persona_Record = {
	purchase_id: string;
	transaction_fee: number;
	officer_id: string;
	transaction_type: string;
	dt_transaction: string;
	notes: string;
};


export type ColumnDef<T> = {
	accessorKey: keyof T & string;
	header: string;
	accessorFn?: (row: T) => any;
	// NEW: A declarative flag for currency formatting.
	isCurrency?: boolean;
};

// ... other existing types ...

export interface FilipinoPerson {
	person_id: string;
	fullname: string;
	national_id: string;
	gender: string;
	birth_date: string;
	barrio_name: string;
	city_name: string | null;
	province_name: string | null;
	region_name: string;
}