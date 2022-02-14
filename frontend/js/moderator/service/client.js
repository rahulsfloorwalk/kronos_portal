import $ from "jquery";
import { url } from "../../../config.js";

export function findActiveClients(){
	return $.get(url.api_base_path + "moderator/client");
}