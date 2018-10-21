import React from "react";
import PropTypes from "prop-types";

import { reportAttributePropType } from "../../prop_types";

export default class AuditStoreReportAttributeRow extends React.Component {
	static propTypes = {
		reportAttribute: reportAttributePropType.isRequired,
		selectedOptionId: PropTypes.string,
	};
	render(){
		const selectedOption = this.props.reportAttribute
			.attribute_data
			.options
			.find(o => o.option_id === this.props.selectedOptionId);

		const optionLabel = selectedOption ? selectedOption.option_label : "";

		return(
			<tr>
				<td>{this.props.reportAttribute.label}</td>
				<td>{optionLabel}</td>
			</tr>
		);
	}

}