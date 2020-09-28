import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import FormSelect from "./FormSelect.jsx";

/* Country Selector begins */

class __CountrySelector extends React.Component{
	static propTypes = {
		countries: PropTypes.object,
	};

	render(){
		let countryOptions = [];
		for( let c in this.props.countries){
			countryOptions.push(<option key={c} value={c}>{this.props.countries[c]}</option>);
		}
		return (
			<FormSelect label="Country" name="country" {...this.props}>
				<option value=""></option>
				{countryOptions}
			</FormSelect>
		);
	}
}

var mapStoreToPropsForCountrySelector = function(store){
	return {
		countries: store.countries,
	};
};

export default connect(mapStoreToPropsForCountrySelector)(__CountrySelector);

export { __CountrySelector };

/* Country Selector Ends */
