import PropTypes from "prop-types";

export const auditCyclePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	type: PropTypes.string.isRequired,
	start_date: PropTypes.string.isRequired,
	end_date: PropTypes.string.isRequired,
	client: PropTypes.shape({
		auditor_logo_url: PropTypes.string,
		auditor_display_name: PropTypes.string,
	}).isRequired,
});

export const auditPropType = PropTypes.shape({
	audit_cycle: auditCyclePropType,
	earnings_per_audit: PropTypes.number,
	reimbursement: PropTypes.number,
});

export const auditStorePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	audit_date: PropTypes.string.isRequired,
	status: PropTypes.string.isRequired,
	earnings_per_audit: PropTypes.number,
	reimbursement: PropTypes.number,
	audit: auditPropType,
});

export const applicationPropType = PropTypes.shape({
	status: PropTypes.string.isRequired,
	audit_date: PropTypes.string.isRequired,
});


export const additionalInfoPropType = PropTypes.shape({
	has_car: PropTypes.bool,
	weekend_audit: PropTypes.bool,
	camera_owned: PropTypes.bool,
	smart_phone_owned: PropTypes.bool,
	laptop_owned: PropTypes.bool,
	is_complete: PropTypes.bool,
	interest_area: PropTypes.array,

	referral_code: PropTypes.string,
	occupation: PropTypes.string,
	distance: PropTypes.number,
	industry: PropTypes.string,
	company: PropTypes.string,
	car_model: PropTypes.string,
	car_cost: PropTypes.string,
	laptop_model: PropTypes.string,
	mobile_model: PropTypes.string,
	camera_resoulution: PropTypes.number,
	mspa_code: PropTypes.string,
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
