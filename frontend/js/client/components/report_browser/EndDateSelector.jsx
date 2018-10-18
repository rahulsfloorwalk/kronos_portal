import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import moment from "moment";
import Datetime from "react-datetime";

import { selectEndDate } from "../../actions/report_browser";
import { reportBrowserSelectors } from "../../selectors";

const selectStyle = {
	display: "inline-block",
	width: "150px",
};

export class EndDateSelector extends React.Component {
	static propTypes = {
		min: PropTypes.string,
		max: PropTypes.string,
		selectedEndDate: PropTypes.string,

		onSelect: PropTypes.func.isRequired,
	};

	validateEndDate = (currentDate) => {
		if(this.props.min && this.props.max) {
			return currentDate.isBetween(moment(this.props.min), moment(this.props.max), null, "[]");
		} else {
			return true;
		}
	};

	render(){
		if(this.props.selectedEndDate){
			return (
				<div style={selectStyle}>
					&nbsp;End Date:
					<Datetime name="end_date"
						value={moment(this.props.selectedEndDate)}
						onChange={date => this.props.onSelect(date.format("YYYY-MM-DD"))}
						isValidDate={this.validateEndDate}
						timeFormat={false}
						dateFormat="YYYY-MM-DD"
						closeOnSelect={true}/>
				</div>
			);
		} else {
			return null;
		}
	}
}

const mapStateToProps = (state) => {
	return {
		min: reportBrowserSelectors.findMinimumEndDateBySelectedAuditCycle(state),
		max: reportBrowserSelectors.findMaximumEndDateBySelectedAuditCycle(state),
		selectedEndDate: reportBrowserSelectors.findSelectedEndDateBySelectedAuditCycle(state),
	};
};

export default connect(mapStateToProps, {
	onSelect: selectEndDate,
})(EndDateSelector);
