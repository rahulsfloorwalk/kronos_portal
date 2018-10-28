import React from "react";
import PropTypes from "prop-types";
import { reportAttributePropType } from "../../prop_types";

const selectStyle = {
	display: "inline-block",
	width: "200px",
};

export class ReportAttributeFilter extends React.Component {
	static propTypes = {
		reportAttribute: reportAttributePropType,
		selectedOptionId: PropTypes.string,
		onSelect: PropTypes.func.isRequired,
	};

	render(){
		const options = this.props.reportAttribute.attribute_data.options
			.map(o => <option key={o.option_id} value={o.option_id}>
				{o.option_label}
			</option>);
		return (
			<div style={selectStyle}>
				&nbsp;{this.props.reportAttribute.label}:
				<select onChange={e => this.props.onSelect(e.target.value)} value={this.props.selectedOptionId || ""} className="form-control" style={selectStyle}>
					<option value="">All Types</option>
					{options}
				</select>
			</div>
		);
	}
}
