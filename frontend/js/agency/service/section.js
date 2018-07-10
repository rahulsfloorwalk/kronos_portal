import axios from "axios";
import { url } from "../../../config";

export function fetchSections(auditStoreId){
	return axios.get( url.api_base_path + `agency/audit_store/${auditStoreId}/section`).then( r => r.data);
}

