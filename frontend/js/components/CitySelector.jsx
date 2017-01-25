import React from 'react';
import * as ReactRedux from 'react-redux';

import FormSelect from './FormSelect.jsx';

/* City Selector Starts */

var __CitySelector = React.createClass({
	render : function(){
		let cityOptions = [];
		for( let c in this.props.cities){
			cityOptions.push(<option key={c} value={c}>{this.props.cities[c].name}</option>);
		}
		return (
			<FormSelect label="City" name="city" {...this.props}>
				<option value=""></option>
				{cityOptions}
			</FormSelect>
		);
	}
});

var mapStoreToPropsForCitySelector = function(store){
	return {
		cities: store.cities,
	};
};

export default ReactRedux.connect(mapStoreToPropsForCitySelector)(__CitySelector);

/* City Selector Ends */
