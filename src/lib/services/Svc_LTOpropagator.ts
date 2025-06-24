import { fail } from '@sveltejs/kit';
import { graphine } from '$lib/services/Svc_Api';
import { broadcastToRoles } from '$lib/server/broadcast';
import type { Purchase_Record as Vehicle, User } from '$lib/types';

// The internal helper is still correct and useful.
async function processAndBroadcast(
	dbFunction: string,
	dbPayload: object,
	broadcastEventType: string,
	broadcastPayload: object,
	targetRoles: string[]
) {
	const result = await graphine('POST', { e: dbFunction, w: [JSON.stringify(dbPayload)] });
	broadcastToRoles(targetRoles, { type: broadcastEventType, payload: broadcastPayload });
	return result;
}

interface FinalizePurchaseOptions {
	buyer: User;
	vehicle: Vehicle;
	paymentType: 'cash' | 'loan';
	price: number;
	loanBranchId?: number;
}

/**
 * CORRECTED: This function now ONLY handles the purchase action.
 * It calls fn_newpurchase and broadcasts to the Notary. That is all.
 */
export async function finalizeNewPurchase({
	buyer,
	vehicle,
	paymentType,
	price,
	loanBranchId
}: FinalizePurchaseOptions) {
	try {
		await processAndBroadcast(
			'vehicles.fn_newpurchase',
			{
				vin: vehicle.vin,
				owner_national_id: buyer.national_id,
				purchase_value: price,
				purchase_type: paymentType,
				source: vehicle.source,
				loan_id: paymentType === 'loan' ? loanBranchId : null
			},
			'new_purchase_for_notary', // The event Notary will listen for
			{ purchase_id: vehicle.purchase_id, vin: vehicle.vin },
			['notary'] // The target role
		);
		return { success: true, message: `Purchase of ${vehicle.vin} submitted for notarization!` };
	} catch (error: any) {
		console.error(`Error during purchase finalization:`, error);
		const errorMessage = error.body?.message || error.message || 'An unexpected server error occurred.';
		return fail(500, { success: false, message: errorMessage });
	}
}

interface ProcessStepOptions {
	currentUser: User;
	purchaseId: string;
	vin: string;
	transactionType: 'Notary' | 'Insurance' | 'Clearance' | 'Registration';
	fee: string;
	notes: string;
	nextRoles: string[];
}

/**
 * This function correctly handles all subsequent steps (Notary, Insurance, etc.)
 */
export async function processLtoStep({
	currentUser,
	purchaseId,
	vin,
	transactionType,
	fee,
	notes,
	nextRoles
}: ProcessStepOptions) {
	try {
		await processAndBroadcast(
			'vehicles.fn_newltoprocess',
			{
				purchase_id: purchaseId,
				transaction_type: transactionType,
				officer_id: currentUser.national_id,
				transaction_fee: fee,
				notes: notes
			},
			`new_task_${nextRoles.join('_')}`, // e.g., new_task_insurance_clearance
			{ purchase_id: purchaseId, vin: vin },
			nextRoles
		);
		return { success: true, message: `${transactionType} step processed for ${vin}.` };
	} catch (error: any) {
		console.error(`Error during ${transactionType} processing:`, error);
		const errorMessage =
			error.body?.message || error.message || 'An unexpected server error occurred.';
		return fail(500, { success: false, message: errorMessage });
	}
}