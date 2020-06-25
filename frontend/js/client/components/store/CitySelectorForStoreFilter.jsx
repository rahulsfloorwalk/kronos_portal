import React, { Component } from "react";
import PropTypes from "prop-types";

class CitySelectorForStoreFilter extends Component {
	static propTypes = {
		citiesRows: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
		})),
		name: PropTypes.string,
		selectedCity: PropTypes.string,

		onChange: PropTypes.func.isRequired,
	};

	render() {
		const selectStyle = {
			display: "inline-block",
			width: "150px",
		};
		const { name, citiesRows, selectedCity, onChange } = this.props;
		return (
			<div style={selectStyle}>
				&nbsp;<b>City</b>:
				<select name={name} value={selectedCity} className="form-control" style={selectStyle} onChange={onChange}>
					<option value="">Select City</option>
					{/* <option value="all">All Cities</option> */}
					{
						citiesRows.map(city => <option key={city.id} value={city.id}>{city.name}</option>)
					}
				</select>
			</div>
		);
	}
}

export default CitySelectorForStoreFilter;