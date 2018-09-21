import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import moment from "moment";
import Datetime from "react-datetime";

import { selectEndDate } from "../../actions/report_browser";
import { reportBrowserSelectors } from "../../selectors";

const selectStyle = {
	display: "inline-block",
	width: "200px",
};

export class EndDateSelector extends React.Component {
	static propTypes = {
		min: PropTypes.string.isRequired,
		max: PropTypes.string.isRequired,
		selectedEndDate: PropTypes.string.isRequired,

		onSelect: PropTypes.func.isRequired,
	};

	validateEndDate = (currentDate, selectedDate) => {
		return currentDate.isBetween(moment(this.props.min), moment(this.props.max), null, "[]");
	};

	render(){
		return (
			<div style={selectStyle}>
				<label className="control-label">&nbsp;End Date:</label>
				<Datetime name="end_date"
					value={moment(this.props.selectedEndDate)}
					onChange={date => this.props.onSelect(date.format("YYYY-MM-DD"))}
					isValidDate={this.validateEndDate}
					timeFormat={false}
					dateFormat="YYYY-MM-DD"
					closeOnSelect={true}/>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		min: reportBrowserSelectors.findMinimumDate(state),
		max: reportBrowserSelectors.findMaximumDate(state),
		selectedStartDate: reportBrowserSelectors.findSelectedStartDate(state),
	};
};

export default connect(mapStateToProps, {
	onSelect: selectEndDate,
})(EndDateSelector);
