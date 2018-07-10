import axios from "axios";

export function fetchAuditStores(){
	return axios.get("/agency/audit_store").then(r => r.data);
}

export function fetchAuditStore(auditStoreId){
	return axios.get(`/agency/audit_store/${auditStoreId}`).then(r => r.data);
}

export function acknowledgeAuditStore(auditStoreId){
	return axios.post(`/agency/audit_store/${auditStoreId}/acknowledge`).then(r => r.data);
}

export function submitAuditStore(auditStoreId){
	return axios.post(`/agency/audit_store/${auditStoreId}/submit`).then(r => r.data);
}
