import axios from "axios";

export function fetchAuditStores(){
	return axios.get("/agency/audit_store").then(r => r.data);
}

