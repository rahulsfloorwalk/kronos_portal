import $ from "jquery";
import { url } from "../../../config.js";

export function findPayments(){
	return $.get( url.api_base_path + "auditor/payment");
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
