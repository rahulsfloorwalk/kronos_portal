import $ from "jquery";
import { url } from "../../../config.js";

export function findPaymentsByAuditCycleId(audit_cycle_id, start_date, end_date){
	if(start_date == "" && end_date == ""){
		return $.get( url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/payment`);
	}
	else{
		let data = {
			start_date: start_date,
			end_date: end_date
		};
		return $.post( url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/payment`,data);
	}
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
