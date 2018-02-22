import axios from "axios";

export function fetchStates(){
	return axios.get("/agency/states").then(r => r.data);
}

export function fetchCities(state_code){
	return axios.get(`/agency/states/${state_code}/city`).then(r => r.data);
}
