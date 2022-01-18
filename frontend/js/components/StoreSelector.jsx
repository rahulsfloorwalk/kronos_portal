import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";

import Select from "react-select";
import {errorList} from "../manager/prop_types.js";
import FormGroup from "./FormGroup.jsx";
import FormErrorList from "./FormErrorList.jsx";

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
		value: PropTypes.string,
		onChange: PropTypes.func,
		errors: errorList
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

		for(let option of optionss){
			storeOptions.push({
				label: `${option.city} -- ${option.store}(${option.code})`,
				value: option.value
			});
		}
		return (
			<FormGroup>
				<label>Select store</label>
				<Select
					name="store"
					value={this.props.value ? storeOptions.filter(obj => this.props.value === obj.value) : null}
					onChange={this.props.onChange}
					isClearable={true}
					options={storeOptions}/>
				<FormErrorList errors={this.props.errors}/>
			</FormGroup>
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
