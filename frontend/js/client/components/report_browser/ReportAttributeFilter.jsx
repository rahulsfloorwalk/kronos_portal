import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { reportAttributePropType } from "../../prop_types";

import { reportAttributeSelectors } from "../../selectors";
import { selectReportAttributeOption } from "../../reducers/report_attribute";

const selectStyle = {
	display: "inline-block",
	width: "200px",
};

export class ReportAttributeFilter extends React.Component {
	static propTypes = {
		auditCycleId: PropTypes.number.isRequired,
		reportAttribute: reportAttributePropType.isRequired,
		selectedOptionId: PropTypes.string,

		selectReportAttributeOption: PropTypes.func.isRequired,
	};

	onSelect = (e) => {
		this.props.selectReportAttributeOption(this.props.auditCycleId, this.props.reportAttribute.json_id, e.target.value);
	};

	render(){
		const options = this.props.reportAttribute.attribute_data.options
			.map(o => <option key={o.option_id} value={o.option_id}>
				{o.option_label}
			</option>);
		return (
			<div style={selectStyle}>
				&nbsp;{this.props.reportAttribute.label}:
				<select onChange={this.onSelect} value={this.props.selectedOptionId || ""} className="form-control" style={selectStyle}>
					<option value="">All Types</option>
					{options}
				</select>
			</div>
		);
	}
}

const mapStateToProps = (store, ownProps) => {
	return {
		selectedOptionId: reportAttributeSelectors.findSelectedOptionIdByAuditCycleIdAndJsonId(store, ownProps.auditCycleId, ownProps.reportAttribute.json_id),
	};
};

export default connect(mapStateToProps, {
	selectReportAttributeOption,
})(ReportAttributeFilter);