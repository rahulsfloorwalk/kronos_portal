import axios from "axios";

export function fetchUser(){
	return axios.get("/agency/user").then(r => r.data);
}

