import axios from "axios";

export function fetchPresence(state_code){
	return axios.get(`/agency/presence/state/${state_code}`).then(r => r.data);
}

export function setPresent(city_id, present){
	if(present){
		return axios.post(`/agency/presence/city/${city_id}/present`).then(r => r.data);
	} else {
		return axios.delete(`/agency/presence/city/${city_id}/present`).then(r => r.data);
	}
}
