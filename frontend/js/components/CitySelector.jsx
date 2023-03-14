import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import FormSelect from "./FormSelect.jsx";

/* City Selector Starts */

class __CitySelector extends React.Component{
	static propTypes = {
		cities: PropTypes.object,
	};

	render(){
		let cityOptions = [];
		cityOptions.push(<option key='all' value={11132323}>All</option>);
		for( let c of this.props.cities){
			cityOptions.push(<option key={c.id} value={c.id}>{c.name}</option>);
		}
		return (
			<FormSelect label="City" name="city" {...this.props}>
				<option value=""></option>
				{cityOptions}
			</FormSelect>
		);
	}
}

var mapStoreToPropsForCitySelector = function(store){
	return {
		cities: store.cities,
	};
};

export default connect(mapStoreToPropsForCitySelector)(__CitySelector);

/* City Selector Ends */

export { __CitySelector };
