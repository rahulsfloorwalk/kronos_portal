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
		remainingStore: PropTypes.objectOf(PropTypes.shape({
			name: PropTypes.string,
			code: PropTypes.oneOf[PropTypes.string, null],
			city: PropTypes.shape({
				name: PropTypes.string,
			}),
		}
		)),
		single_store: PropTypes.objectOf(PropTypes.shape({
			name: PropTypes.string,
			code: PropTypes.oneOf[PropTypes.string, null],
			city: PropTypes.shape({
				name: PropTypes.string,
			}),
		}
		)),
		values: PropTypes.array,
		value:PropTypes.object,
		auditId:PropTypes.string,
		onChange: PropTypes.func,
		errors: errorList
	};

	render() {
		let storeOptions = [];
		let optionss = [];
		for( let s in this.props.remainingStore){
			optionss.push({
				"value": s,
				"city": this.props.remainingStore[s].city.name,
				"store": this.props.remainingStore[s].name,
				"code": this.props.remainingStore[s].code
			});
		}

		let sortBy = [{
			prop:"city",
			direction: 1
		},{
			prop:"store",
			direction: 1
		}];

		optionss.sort(function(a,b){
			let i = 0, result = 0;
			while(i < sortBy.length && result === 0) {
				result = sortBy[i].direction*(a[ sortBy[i].prop ].toString() < b[ sortBy[i].prop ].toString() ? -1 : (a[ sortBy[i].prop ].toString() > b[ sortBy[i].prop ].toString() ? 1 : 0));
				i++;
			}
			return result;
		});

		for(let option of optionss){
			storeOptions.push({
				label: `${option.city} -- ${option.store}(${option.code})`,
				value: option.value
			});
		}
		let singleOption=[];
		let  singleOptions=[];
		if(this.props.single_store && typeof(this.props.single_store)=="object"){
			singleOptions.push({
				"value": this.props.single_store.id,
				"city":this.props.single_store.city.name,
				"store":this.props.single_store.name,
				"code":this.props.single_store.code
			});
			for (let option of singleOptions){
				singleOption.push({
					label: `${option.city} --${option.store}(${option.code})`,
					value: option.value
				});
			}
		}
		let selector=
		this.props.auditId && this.props.value ?
			<Select
				name="store"
				isDisabled={true}
				value={this.props.value ? singleOption.filter(obj => this.props.value.id == obj.value) : null }
			/> :
			<Select
				isMulti={true}
				name="store"
				value={this.props.values ? storeOptions.filter(obj => this.props.values.includes(obj.value) === true ) : null}
				onChange={this.props.onChange}
				isClearable={true}
				options={storeOptions}/>;
		return (
			<FormGroup>
				<label>Select store</label>
				{selector}
				<FormErrorList errors={this.props.errors}/>
			</FormGroup>
		);
	}
}

var mapStoreToPropsForStoreSelector = function(remainingStore,store){
	return {
		remainingStore: remainingStore.remainingStore,
		single_store:store.value,
	};
};

export default ReactRedux.connect(mapStoreToPropsForStoreSelector)(StoreSelector);

/* Store Selector Ends */
