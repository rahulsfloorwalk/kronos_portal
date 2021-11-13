import PropTypes from "prop-types";

export const profileInfoPropType = PropTypes.shape({
	id: PropTypes.number,
	first_name: PropTypes.string,
	last_name: PropTypes.string,
});

export const userPropType = PropTypes.shape({
	id: PropTypes.number,
	profileinfo: profileInfoPropType,
	email: PropTypes.string,
});

export const auditCyclePropType = PropTypes.shape({
	type: PropTypes.string.isRequired,
	client: clientPropType,
	post_approval_description: PropTypes.string,
});

export const clientPropType = PropTypes.shape({ });

export const storePropType = PropTypes.shape({
	id: PropTypes.number,
	client_id: PropTypes.number,
	code: PropTypes.string,
	priority: PropTypes.string,
	address: PropTypes.string,
	name: PropTypes.string,
	type: PropTypes.string,
	phone: PropTypes.string,
	city: PropTypes.shape({
		name: PropTypes.string,
		state: PropTypes.string,
	}),
});

export const auditPropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	earnings_per_audit: PropTypes.number,
	reimbursement: PropTypes.number,
	post_approval_description: PropTypes.string,
	audit_cycle: auditCyclePropType.isRequired,
	store: storePropType.isRequired,
});

export const auditStorePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	status: PropTypes.string.isRequired,
	earnings_per_audit: PropTypes.number,
	reimbursement: PropTypes.number,
	audit_date: PropTypes.string.isRequired,
	audit_store_percentage: PropTypes.number,
	audit: auditPropType.isRequired,
	user: userPropType,
});

export const reportAttributePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	label: PropTypes.string.isRequired,
	json_id: PropTypes.string.isRequired,
	attribute_data: PropTypes.shape({
		version: PropTypes.number.isRequired,
		options: PropTypes.arrayOf(PropTypes.shape({
			option_id: PropTypes.string.isRequired,
			option_label: PropTypes.string.isRequired,
		})),
	}).isRequired,
});

export const errorList = PropTypes.arrayOf(PropTypes.string);


export const sectionPropType =  PropTypes.shape({
	id: PropTypes.number.isRequired,
	sequence: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	max_marks: PropTypes.number.isRequired,
	questions: PropTypes.arrayOf(PropTypes.shape({
	})),
});

export const reportSectionPropType = PropTypes.shape({
	auditor_comment: PropTypes.string,
	pm_comment: PropTypes.string,
	not_applicable: PropTypes.bool,
	marks_obtained: PropTypes.number,
	max_marks: PropTypes.number.isRequired,
});

export const attachmentPropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	direct_url: PropTypes.string.isRequired,
	mime_type: PropTypes.string.isRequired,
	proof_type: PropTypes.string.isRequired,
	extra: PropTypes.shape({
		preview_url: PropTypes.string,
	}),
});
