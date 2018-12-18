import types from "../action_types.js";
import * as sectionService from "../service/section";
import { setFormErrors, resetFormErrors } from "../reducers/forms";
import { updateSections, updateSection } from "../reducers/section";

export const fetchSections = (auditCycleId) => {
	return (dispatch) => {
		return sectionService.fetchSectionsByAuditCycleId(auditCycleId).then((sections) => {
			return dispatch(updateSections(sections));
		});
		//TODO: Handle error
	};
};

export const fetchSection = (sectionId) => {
	return (dispatch) => {
		return sectionService.fetchSectionById(sectionId).then((section) => {
			return dispatch(updateSection(section));
		});
		//TODO: Handle error
	};
};

export const loadSectionAddForm = () => {
	return (dispatch) => {
		return dispatch(resetFormErrors());
	};
};

export const loadSectionEditForm = (sectionId) => {
	return (dispatch) => {
		dispatch(resetFormErrors());
		return dispatch(fetchSection(sectionId));
	};
};

export const saveSectionAddForm = (section) => {
	return (dispatch) => {
		dispatch(resetFormErrors());
		return sectionService.addSection(section).then((savedSection) => {
			return dispatch(updateSection(savedSection));
		}, (error) => {
			return dispatch(setFormErrors(error.responseJSON));
		});
	};
};

export const saveSectionEditForm = (section) => {
	return (dispatch) => {
		dispatch(resetFormErrors());

		return sectionService.updateSection(section).then((savedSection) => {
			dispatch(updateSection(savedSection));
		}, (error) => {
			dispatch(setFormErrors(error.responseJSON));
		});
	};
};

export const deleteSection = (sectionId) => {
	return (dispatch) => {
		const req = sectionService.deleteSection(sectionId);
		req.done(() => {
			dispatch({
				type: types.SECTION_ID_DELETE,
				status: "success",
				sectionId,
			});
		});
		req.fail(() => {
			dispatch({
				type: types.SECTION_ID_DELETE,
				status: "error",
				sectionId,
			});
		});
		return req;
	};
};

