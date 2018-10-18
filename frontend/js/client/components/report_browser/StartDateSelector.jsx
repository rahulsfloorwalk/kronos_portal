import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import moment from "moment";
import Datetime from "react-datetime";

import { selectStartDate } from "../../reducers/report_browser";
import { reportBrowserSelectors } from "../../selectors";

const selectStyle = {
	display: "inline-block",
	width: "150px",
};

export class StartDateSelector extends React.Component {
	static propTypes = {
		min: PropTypes.string,
		max: PropTypes.string,
		selectedStartDate: PropTypes.string,

		onSelect: PropTypes.func.isRequired,
	};

	validateStartDate = (currentDate) => {
		if(this.props.min && this.props.max) {
			return currentDate.isBetween(moment(this.props.min), moment(this.props.max), null, "[]");
		} else {
			return true;
		}
	};

	render(){
		if(this.props.selectedStartDate){
			return (
				<div style={selectStyle}>
					&nbsp;Start Date:
					<Datetime name="end_date"
						value={moment(this.props.selectedStartDate)}
						onChange={date => this.props.onSelect(date.format("YYYY-MM-DD"))}
						isValidDate={this.validateStartDate}
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
		min: reportBrowserSelectors.findMinimumStartDateBySelectedAuditCycle(state),
		max: reportBrowserSelectors.findMaximumStartDateBySelectedAuditCycle(state),
		selectedStartDate: reportBrowserSelectors.findSelectedStartDateBySelectedAuditCycle(state),
	};
};

export default connect(mapStateToProps, {
	onSelect: selectStartDate,
})(StartDateSelector);
