import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { selectState } from "../../actions/report_browser";
import { reportBrowserSelectors } from "../../selectors";

const selectStyle = {
	display: "inline-block",
	width: "200px",
};

export class StateSelector extends React.Component {
	static propTypes = {
		states: PropTypes.arrayOf(PropTypes.string.isRequired),
		selectedState: PropTypes.string,

		onSelect: PropTypes.func.isRequired,
	};
	getSelectedValue(selectedState){
		return selectedState === "" ? null : selectedState;
	}
	render(){
		if(this.props.states.length < 2) {
			return null;
		}
		return (<div style={selectStyle}>
			&nbsp;State:
			<select onChange={e => this.getSelectedValue(this.props.onSelect(e.target.value))} value={this.props.selectedState || ""} className="form-control" style={selectStyle}>
				<option value="">All States</option>
				{this.props.states.map((s, i) => <option key={i} value={s}>{s}</option>)}
			</select>
		</div>);
	}
}

const mapStateToProps = (state) => {
	return {
		states: reportBrowserSelectors.findStatesBySelectedAuditCycle(state),
		selectedState: reportBrowserSelectors.findSelectedState(state),
	};
};

export default connect(mapStateToProps, {
	onSelect: selectState,
})(StateSelector);
