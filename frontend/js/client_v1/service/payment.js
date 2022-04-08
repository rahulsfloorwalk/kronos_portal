import $ from "jquery";
import { url } from "../../../config.js";


export function createPaymentOrder(client_id, checkout_data){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `client_v1/client/${client_id}/payment`,
		data: JSON.stringify(checkout_data),
		contentType: "application/json"
	});
}


export function validatePaymentOrder(client_id,response){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `client_v1/client/${client_id}/payment_resp`,
		data: JSON.stringify(response),
		contentType: "application/json"
	});
}


export function getClientPayments(client_id){
	return $.get( url.api_base_path + `client_v1/client/${client_id}/payment`);
}

export function failedPaymentOrder(error){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + "client_v1/client/payment_failed",
		data: JSON.stringify({
			code: error.code,
			description: error.description,
			reason: error.reason,
			order_id: error.metadata.order_id,
			payment_id: error.metadata.payment_id,
		}),
		contentType: "application/json"
	});
}