import PropTypes from "prop-types";

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