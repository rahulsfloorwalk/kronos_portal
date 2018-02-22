import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import FormSelect from "./FormSelect.jsx";

/* State Selector begins */

class __StateSelector extends React.Component{
	static propTypes = {
		states: PropTypes.object,
	};

	render(){
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
}

var mapStoreToPropsForStateSelector = function(store){
	return {
		states: store.states,
	};
};

export default connect(mapStoreToPropsForStateSelector)(__StateSelector);

export { __StateSelector };

/* State Selector Ends */
