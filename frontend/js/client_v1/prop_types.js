import PropTypes from "prop-types";

export const auditCyclePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	start_date: PropTypes.string.isRequired,
	end_date: PropTypes.string.isRequired,
});

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

export const errorList = PropTypes.arrayOf(PropTypes.string);


export const auditApplicationPropType = PropTypes.shape({
	audit: PropTypes.number,
	audit_date: PropTypes.string,
	avg_qa_rating: PropTypes.number,
	distance: PropTypes.string,
	id: PropTypes.number,
	status: PropTypes.string,
	report_exists: PropTypes.bool,
	report_exists_data: PropTypes.shape({
		audit_cycle_id: PropTypes.number,
		audit_cycle_name: PropTypes.string,
		audit_date: PropTypes.string
	}),
	profileinfo: PropTypes.shape({
		id: PropTypes.number,
		first_name: PropTypes.string,
		last_name: PropTypes.string,
		auditor_rating: PropTypes.string,
		avg_auditor_rating: PropTypes.string,
		mobile_number: PropTypes.string,
		pincode: PropTypes.string,
		city: PropTypes.number,
		user_id: PropTypes.number
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

export const sectionPropType =  PropTypes.shape({
	id: PropTypes.number.isRequired,
	sequence: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	max_marks: PropTypes.number.isRequired,
	questions: PropTypes.arrayOf(PropTypes.shape({
	})),
});