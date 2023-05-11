import $ from "jquery";
import { url } from "../../../config";

export function fetchCertificateScore(){
	return $.get( url.api_base_path + "auditor/certification_marks");
}
