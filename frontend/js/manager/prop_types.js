import PropTypes from "prop-types";

export const auditStorePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	status: PropTypes.string.isRequired,
	earnings_per_audit: PropTypes.number,
	reimbursement: PropTypes.number,
	audit_date: PropTypes.string.isRequired,
	audit: PropTypes.shape({
		earnings_per_audit: PropTypes.number,
		reimbursement: PropTypes.number,
		post_approval_description: PropTypes.string,
		audit_cycle: PropTypes.shape({
			type: PropTypes.string.isRequired,
			client: PropTypes.shape({
			}),
			post_approval_description: PropTypes.string,
		}).isRequired,
		store: PropTypes.shape({
			name: PropTypes.string.isRequired,
			address: PropTypes.string,
		}).isRequired,
	}).isRequired,
});

