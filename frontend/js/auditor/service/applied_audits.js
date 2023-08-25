import $ from "jquery";
import { url } from "../../../config.js";

export function findAppliedAudits(){
	return $.get( url.api_base_path + "auditor/applied_audits");
}