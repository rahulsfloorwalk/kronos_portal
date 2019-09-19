
import $ from "jquery";
import { url } from "../../../config.js";

let promise;
export function fetchConfig(){
	promise = promise || $.get( url.api_base_path + "agency/config");
	return promise;
}


/*Old Code*/
/*import axios from "axios";

let promise;
export function fetchConfig(){
	return promise || axios.get("/agency/config");
}*/

