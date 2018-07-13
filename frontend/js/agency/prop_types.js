import PropTypes from "prop-types";

import { QuestionType } from "../constants.js";

export const auditStorePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	status: PropTypes.string.isRequired,
	audit_date: PropTypes.string.isRequired,
	audit: PropTypes.shape({
		earnings_per_audit: PropTypes.number,
		reimbursement: PropTypes.number,
		post_approval_description: PropTypes.string,
		audit_cycle: PropTypes.shape({
			type: PropTypes.string.isRequired,
			client: PropTypes.shape({
				auditor_display_name: PropTypes.string.isRequired,
			}),
			post_approval_description: PropTypes.string,
		}).isRequired,
		store: PropTypes.shape({
			name: PropTypes.string.isRequired,
			address: PropTypes.string,
		}).isRequired,
	}).isRequired,
});

export const questionPropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	sequence: PropTypes.number.isRequired,
	question_txt: PropTypes.string.isRequired,
	question_type: PropTypes.oneOf(QuestionType).isRequired,
	question_data: PropTypes.object.isRequired,
});
