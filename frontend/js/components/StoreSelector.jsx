import React from 'react';
import * as ReactRedux from 'react-redux';

import FormSelect from './FormSelect.jsx';

/* Store Selector Starts */

class StoreSelector extends React.Component {
    render() {
		let storeOptions = [];
		for( let s in this.props.stores){
			storeOptions.push(<option key={s} value={s}>{this.props.stores[s].city.name} -- {this.props.stores[s].name}</option>);
		}
		return (
			<FormSelect label="Store" name="store" {...this.props}>
				<option value=""></option>
				{storeOptions}
			</FormSelect>
		);
	}
}

var mapStoreToPropsForStoreSelector = function(store){
	return {
		stores: store.stores,
	};
};

export default ReactRedux.connect(mapStoreToPropsForStoreSelector)(StoreSelector);

/* Store Selector Ends */
