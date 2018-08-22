import $ from "jquery";
import { url } from "../../../config.js";

export function findPaymentsByAuditCycleId(audit_cycle_id){
	return $.get( url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/payment`);
}

export function findPaymentsByUserId(user_id){
	return $.get( url.api_base_path + `manager/auditor/${user_id}/payment`);
}

export function payAllPendingPaymentsForAuditCycle(audit_cycle_id){
	return $.post( url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/payment/pending/pay`);
}

export function pay(paymentId){
	return $.post( url.api_base_path + `manager/payment/${paymentId}/pay`);
}

export function fail(paymentId){
	return $.post( url.api_base_path + `manager/payment/${paymentId}/fail`);
}
