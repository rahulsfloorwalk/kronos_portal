import $ from "jquery";
import { url } from "../../../config.js";

export const copySectionsFromTo = (fromAuditCycleId, toAuditCycleId) => {
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `manager/audit_cycle/${toAuditCycleId}/section/copy`,
		data: JSON.stringify({
			from_audit_cycle_id: fromAuditCycleId
		}),
		contentType: "application/json"
	});
};


export const updateSection = (section) => {
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `manager/section/${section.id}`,
		data: JSON.stringify(section),
		contentType: "application/json"
	});
};

export const addSection = (section) => {
	return $.ajax({
		type: "POST",
		url: url.api_base_path + "manager/section",
		data: JSON.stringify(section),
		contentType: "application/json"
	});
};

export const deleteSection = (sectionId) => {
	return $.ajax({
		type: "DELETE",
		url: url.api_base_path + `manager/section/${sectionId}`,
	});
};

export const fetchSectionById = (sectionId) => {
	return $.ajax({
		type: "GET",
		url: url.api_base_path + `manager/section/${sectionId}`,
	});
};

export const fetchSectionsByAuditCycleId = (auditCycleId) => {
	return $.ajax({
		type: "GET",
		url: url.api_base_path + `manager/audit_cycle/${auditCycleId}/section`,
	});
};
