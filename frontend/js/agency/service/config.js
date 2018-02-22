import axios from "axios";

let promise;
export function fetchConfig(){
	return promise || axios.get("/agency/config");
}

