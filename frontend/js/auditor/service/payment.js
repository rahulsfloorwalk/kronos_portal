import $ from "jquery";
import { url } from "../../../config.js";

export function findPayments(){
	return $.get( url.api_base_path + "auditor/payment");
}

