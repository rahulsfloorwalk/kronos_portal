import axios from "axios";
import { url } from "../../../config";

export function fetchAnswers(auditStoreId){
	return axios.get( url.api_base_path + `agency/audit_store/${auditStoreId}/answer`).then( r => r.data);
}

