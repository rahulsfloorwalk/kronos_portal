import axios from "axios";

export function fetchAgency(){
	return axios.get("/agency/agency").then(r => r.data);
}

export function saveAgency(data){
	return axios.post("/agency/agency", data).then(r => r.data);
}

