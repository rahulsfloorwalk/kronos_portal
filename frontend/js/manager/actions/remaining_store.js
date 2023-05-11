import $ from "jquery";
import { url } from "../../../config.js";
import types from "../action_types.js";

export function fetchRemainingStores(auditCycleId){
	return function(dispatch){
		dispatch({
			type: types.REMAINING_STORE_GET_BY_AUDIT_CYCLE_ID,
			status: "request",
			auditCycleId: auditCycleId
		});
		return $.get( url.api_base_path+ `manager/audit_cycle/${auditCycleId}/rem_store`,function(remainingStore){
			dispatch({
				type: types.REMAINING_STORE_GET_BY_AUDIT_CYCLE_ID,
				status: "success",
				remainingStore:remainingStore
			});
		});
	};
}