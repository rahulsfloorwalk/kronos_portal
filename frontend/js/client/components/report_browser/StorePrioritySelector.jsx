import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { selectPriority } from "../../actions/report_browser";
import { reportBrowserSelectors } from "../../selectors";

const selectStyle = {
	display: "inline-block",
	width: "200px",
};

export class StorePrioritySelector extends React.Component {
	static propTypes = {
		storePriorities: PropTypes.arrayOf(PropTypes.string),
		selectedStorePriority: PropTypes.string,

		onSelect: PropTypes.func.isRequired,
	};

	render(){
		return (
			<div style={selectStyle}>
				&nbsp;Store Priority:
				<select onChange={e => this.props.onSelect(e.target.value)} value={this.props.selectedStorePriority || ""} className="form-control" style={selectStyle}>
					<option value="">All Types</option>
					{this.props.storePriorities.filter(t=>!!t).map(t => <option key={t} value={t}>{t}</option>)}
				</select>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	storePriorities: reportBrowserSelectors.findStorePrioritiesBySelectedAuditCycle(state),
	selectedPriority: reportBrowserSelectors.findSelectedStorePriority(state),
});

export default connect(mapStateToProps, {
	onSelect: selectPriority,
})(StorePrioritySelector);
