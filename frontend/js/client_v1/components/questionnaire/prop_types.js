import PropTypes from "prop-types";

export const questionPropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	sequence: PropTypes.number.isRequired,
	question_txt: PropTypes.string.isRequired,
	question_type: PropTypes.string.isRequired,
	question_data: PropTypes.object,
	max_marks: PropTypes.number.isRequired,
	section: PropTypes.number.isRequired,
});

export const sectionPropType = PropTypes.shape({
	id: PropTypes.number,
	audit_cycle_id: PropTypes.number,
	name: PropTypes.string,
	sequence: PropTypes.number,
	minimum_attachment_count: PropTypes.number,
	max_marks: PropTypes.number.isRequired,
	questions: PropTypes.arrayOf(questionPropType),
});
