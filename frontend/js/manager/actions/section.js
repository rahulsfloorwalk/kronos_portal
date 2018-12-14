import $ from "jquery";
import { url } from "../../../config.js";
import types from "../action_types.js";
import * as sectionService from "../service/section";

export function fetchSections(auditCycleId){
	return function(dispatch){
		dispatch({
			type: types.SECTION_GET,
			status: "request",
			auditCycleId
		});

		return $.get( url.api_base_path + `manager/audit_cycle/${auditCycleId}/section`, function(sections){
			dispatch({
				type: types.SECTION_GET,
				status: "success",
				sections
			});
		});
		//TODO: Handle error
	};
}

export function fetchSection(sectionId){
	return function(dispatch){
		dispatch({
			type: types.SECTION_ID_GET,
			status: "request",
			sectionId
		});

		return $.get( url.api_base_path + `manager/section/${sectionId}`, function(section){
			dispatch({
				type: types.SECTION_ID_GET,
				status: "success",
				section
			});
		});
		//TODO: Handle error
	};
}

export function loadSectionAddForm(){
	return function(dispatch){
		dispatch({
			type: types.SECTION_FORM_LOAD,
			status: "success"
		});
	};
}

export function loadSectionEditForm(sectionId){
	return function(dispatch){
		dispatch({
			type: types.SECTION_FORM_LOAD,
			status: "request",
			sectionId
		});
		return dispatch(fetchSection(sectionId));
	};
}

export function saveSectionAddForm(section){
	return function(dispatch){
		dispatch({
			type: types.SECTION_FORM_SUB,
			status: "request",
			section

		});
		dispatch({
			type: types.SECTION_POST,
			status: "request",
			section
		});

		const req = sectionService.addSection(section);
		req.done(function(savedSection){
			dispatch({
				type: types.SECTION_POST,
				status: "success",
				section: savedSection
			});
			dispatch({
				type: types.SECTION_FORM_SUB,
				status: "success",
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.SECTION_POST,
				status: "error",
				errors: error.responseJSON
			});
			dispatch({
				type: types.SECTION_FORM_SUB,
				status: "error",
			});
		});
		return req;
	};
}

export function saveSectionEditForm(section){
	return function(dispatch){
		dispatch({
			type: types.SECTION_FORM_SUB,
			status: "request"
		});
		dispatch({
			type: types.SECTION_ID_POST,
			status: "request",
			section
		});

		const req = sectionService.updateSection(section);
		req.done(function(savedSection){
			dispatch({
				type: types.SECTION_ID_POST,
				status: "success",
				section: savedSection
			});
			dispatch({
				type: types.SECTION_FORM_SUB,
				status: "success"
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.SECTION_ID_POST,
				status: "error",
				errors: error.responseJSON
			});
			dispatch({
				type: types.SECTION_FORM_SUB,
				status: "error",
			});
		});
		return req;
	};
}

export function deleteSection(sectionId){
	return function(dispatch){
		dispatch({
			type: types.SECTION_ID_DELETE,
			status: "request",
			sectionId,
		});
		const req = sectionService.deleteSection(sectionId);
		req.done(function(){
			dispatch({
				type: types.SECTION_ID_DELETE,
				status: "success",
				sectionId,
			});
		});
		req.fail(function(){
			dispatch({
				type: types.SECTION_ID_DELETE,
				status: "error",
				sectionId,
			});
		});
		return req;
	};
}

