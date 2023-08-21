import $ from "jquery";
import { url } from "../../../config.js";

let promise;
export function fetchUser(){
	promise = promise || $.get( url.api_base_path + "client/user");
	return promise;
}

export function findAllClientUser(auditStoreId){
	return $.get( url.api_base_path + `client/audit_store/${auditStoreId}/admin_and_non_admin_user_for_admin`);
	
}

export function getEmailNotification(){
	return $.get(url.api_base_path + "client/email_notification");
}

export function saveEmailNotification(receive_email_notification){
	return $.ajax({
		type: "POST",
		url : url.api_base_path + "client/email_notification",
		data: JSON.stringify({
			receive_email_notification:receive_email_notification
		}),
		contentType: "application/json"
	});
}
