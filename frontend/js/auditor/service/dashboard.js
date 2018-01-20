import $ from "jquery";
import { url } from "../../../config.js";

export function getProfileCompletionPercentage(){
	return $.get(url.api_base_path + "auditor/profile_completion_percentage");
}

