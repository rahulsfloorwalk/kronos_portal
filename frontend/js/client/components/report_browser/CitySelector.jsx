import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { selectCity } from "../../actions/report_browser";
import { reportBrowserSelectors } from "../../selectors";

const selectStyle = {
	display: "inline-block",
	width: "200px",
};

export class CitySelector extends React.Component {
	static propTypes = {
		cities: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
		})),
		selectedCityId: PropTypes.number,

		onSelect: PropTypes.func.isRequired,
	};

	render(){
		return (<div style={selectStyle}>
			<label className="control-label">&nbsp;City:</label>
			<select onChange={e => this.props.onSelect(parseInt(e.target.value))} value={this.props.selectedCityId} className="form-control" style={selectStyle}>
				<option value="">All Cities</option>
				{this.props.cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
			</select>
		</div>);
	}
}

const mapStateToProps = (state) => {
	return {
		cities: reportBrowserSelectors.findCities(state),
		selectedCityId: reportBrowserSelectors.findSelectedCityId(state),
	};
};

export default connect(mapStateToProps, {
	onSelect: selectCity,
})(CitySelector);
