import $ from "jquery";
import { url } from "../../../config.js";


export function uploadFileForImportStore(clientId, file){

	var formData = new FormData();
	formData.append("client_id", clientId);
	formData.append("file_uploaded", file);

	return $.ajax({
		type: "POST",
		url: url.api_base_path + "client_v1/store/import",
		processData: false,
		contentType: false,
		data: formData,
	});
}