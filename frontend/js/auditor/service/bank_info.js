import $ from "jquery";
import { url } from "../../../config";

export function saveBankInfo(bankInfo){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + "auditor/bank_info",
		data: JSON.stringify(bankInfo),
		contentType: "application/json"
	});
}
