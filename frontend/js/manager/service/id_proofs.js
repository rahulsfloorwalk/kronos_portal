import $ from "jquery";
import { url } from "../../../config.js";

export function findIdProofsForUser(user_id){
	return $.get( url.api_base_path + `manager/auditor/${user_id}/attachment`);
}
