import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { selectStoreType } from "../../reducers/report_browser";
import { reportBrowserSelectors } from "../../selectors";

const selectStyle = {
	display: "inline-block",
	width: "200px",
};

export class StoreTypeSelector extends React.Component {
	static propTypes = {
		storeTypes: PropTypes.arrayOf(PropTypes.string),
		selectedStoreType: PropTypes.string,

		onSelect: PropTypes.func.isRequired,
	};

	render(){
		return (
			<div style={selectStyle}>
				&nbsp;Store Type:
				<select onChange={e => this.props.onSelect(e.target.value)} value={this.props.selectedStoreType || ""} className="form-control" style={selectStyle}>
					<option value="">All Types</option>
					{this.props.storeTypes.filter(t=>!!t).map(t => <option key={t} value={t}>{t}</option>)}
				</select>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	storeTypes: reportBrowserSelectors.findStoreTypesBySelectedAuditCycle(state),
	selectedStoreType: reportBrowserSelectors.findSelectedStoreType(state),
});

export default connect(mapStateToProps, {
	onSelect: selectStoreType,
})(StoreTypeSelector);
