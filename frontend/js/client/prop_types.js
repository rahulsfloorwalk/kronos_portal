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

export const auditCyclePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	start_date: PropTypes.string.isRequired,
	end_date: PropTypes.string.isRequired,
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