import React from 'react';
import * as ReactRedux from 'react-redux';

import FormSelect from './FormSelect.jsx';

/* State Selector begins */

var __StateSelector = React.createClass({
	render : function(){
		let stateOptions = [];
		for( let s in this.props.states){
			stateOptions.push(<option key={s} value={s}>{this.props.states[s]}</option>);
		}
		return (
			<FormSelect label="State" name="state" {...this.props}>
				<option value=""></option>
				{stateOptions}
			</FormSelect>
		);
	}
});

var mapStoreToPropsForStateSelector = function(store){
	return {
		states: store.states,
	};
};

export default ReactRedux.connect(mapStoreToPropsForStateSelector)(__StateSelector);

export { __StateSelector };

/* State Selector Ends */
