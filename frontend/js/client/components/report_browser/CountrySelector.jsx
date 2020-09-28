import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { selectCountry } from "../../actions/report_browser";
import { reportBrowserSelectors } from "../../selectors";

const selectStyle = {
	display: "inline-block",
	width: "200px",
};

export class CountrySelector extends React.Component {
	static propTypes = {
		countries: PropTypes.arrayOf(PropTypes.string.isRequired),
		selectedCountry: PropTypes.string,

		onSelect: PropTypes.func.isRequired,
	};
	getSelectedValue(selectedCountry){
		return (selectedCountry === "" || selectedCountry === undefined) ? null : selectedCountry;
	}
	render(){
		if(this.props.countries.length < 2) {
			return null;
		}
		return (<div style={selectStyle}>
			&nbsp;Country:
			<select onChange={e => this.getSelectedValue(this.props.onSelect(e.target.value))} value={this.props.selectedCountry || ""} className="form-control" style={selectStyle}>
				<option value="">All Countries</option>
				{this.props.countries.map((s, i) => <option key={i} value={s}>{s}</option>)}
			</select>
		</div>);
	}
}

const mapStateToProps = (state) => {
	return {
		countries: reportBrowserSelectors.findCountryBySelectedAuditCycle(state),
		selectedCountry: reportBrowserSelectors.findSelectedCountry(state),
	};
};

export default connect(mapStateToProps, {
	onSelect: selectCountry,
})(CountrySelector);
