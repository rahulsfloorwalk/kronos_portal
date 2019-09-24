import axios from "axios";

export function fetchAgency(){
	return axios.get("/agency/agency_view").then(r => r.data);
}

export function saveAgency(data){
	return axios.post("/agency/agency_view", data).then(r => r.data);
}

