import $ from "jquery";
import { url } from "../../../config.js";

export function findPayments(is_load_more, payment_loaded_count){
	return $.get( url.api_base_path + `auditor/payment?is_load_more=${is_load_more}&last_total_count=${payment_loaded_count}`);
}

export function findPaymentSummary(){
	return $.get( url.api_base_path + "auditor/payment/summary");
}

export function submitConcern(paymentId, message){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `auditor/payment/${paymentId}/payment_concern`,
		data: JSON.stringify({
			message
		}),
		contentType: "application/json"
	});
}
