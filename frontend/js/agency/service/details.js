import $ from "jquery";
import { url } from "../../../config";
import axios from "axios";

export function fetchAgency(){
	return axios.get("/agency/agency_view").then(r => r.data);
}

export function saveAgency(data){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + "agency/agency_view",
		data: JSON.stringify(data),
		contentType: "application/json"
	});
}