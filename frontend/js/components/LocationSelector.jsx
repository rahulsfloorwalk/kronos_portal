import React from 'react';
import * as ReactRedux from 'react-redux';

import FormSelect from './FormSelect.jsx';

/* Location Selector Starts */

var __LocationSelector = React.createClass({
	render : function(){
		let locationOptions = [];
		for( let l in this.props.locations){
			locationOptions.push(<option key={l} value={l}>{this.props.locations[l].name}</option>);
		}
		return (
			<FormSelect label="Location" name="location" {...this.props}>
				<option value=""></option>
				{locationOptions}
			</FormSelect>
		);
	}
});

var mapStoreToPropsForLocationSelector = function(store){
	return {
		locations: store.locations,
	};
};

export default ReactRedux.connect(mapStoreToPropsForLocationSelector)(__LocationSelector);

/* Location Selector Ends */
