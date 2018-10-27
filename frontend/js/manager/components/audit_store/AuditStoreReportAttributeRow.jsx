import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { reportAttributePropType } from "../../prop_types";

export default class AuditStoreReportAttributeRow extends React.Component {
	static propTypes = {
		reportAttribute: reportAttributePropType.isRequired,
		selectedOptionId: PropTypes.string,

		auditStoreId: PropTypes.number.isRequired,
	};
	render(){
		const selectedOption = this.props.reportAttribute
			.attribute_data
			.options
			.find(o => o.option_id === this.props.selectedOptionId);

		const optionLabel = selectedOption ? selectedOption.option_label : "";
		const changeHref = `/audit_store/${this.props.auditStoreId}/report_attribute/${this.props.reportAttribute.json_id}`;

		return(
			<tr>
				<td className="text-right">{this.props.reportAttribute.label}:</td>
				<td>{optionLabel} (<Link to={changeHref}>change</Link>)</td>
			</tr>
		);
	}

}
