import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";

import FormSelect from "./FormSelect.jsx";

/* Store Selector Starts */

class StoreSelector extends React.Component {
	static propTypes = {
		stores: PropTypes.objectOf(PropTypes.shape({
			name: PropTypes.string,
			code: PropTypes.oneOf[PropTypes.string, null],
			city: PropTypes.shape({
				name: PropTypes.string,
			}),
		})),
	};

	render() {
		let storeOptions = [];
		let optionss = [];
		for( let s in this.props.stores){
			optionss.push({
				"value": s,
				"city": this.props.stores[s].city.name,
				"store": this.props.stores[s].name,
				"code": this.props.stores[s].code
			});
		}
		optionss.sort((a,b) => (a.city > b.city) ? 1 : ((b.city > a.city) ? -1 : 0));
		storeOptions = optionss.map(element=><option key={element.value} value={element.value}>{element.city} -- {element.store}({element.code})</option>);
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
