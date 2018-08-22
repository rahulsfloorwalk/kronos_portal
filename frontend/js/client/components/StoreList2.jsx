import React, { Component } from "react";
import { Link, hashHistory } from "react-router";

import { pointerStyle } from "../../styles.js";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import Jumbotron from "../../components/Jumbotron.jsx";
import { getColor } from "../../utils.js";
import { ChevronRight, ChevronDown, ShareAlt } from "../../components/Icons.jsx";

import { fetchAllStores } from "../service/store.js";

export default class StoreList2 extends Component{
	constructor(props){
		super(props);
		this.state = {
			stores: [],
		};
	}
	componentDidMount() {
		fetchAllStores().then((stores)=>{
			this.setState({
				stores
			});
		});
	}
	render(){
		let storeRows = [];
		let index = 0;
		for(let store of this.state.stores) {
			storeRows.push(
				<tr key={store.id} onClick={() => hashHistory.push(`/store/${store.id}/trends`)} style={pointerStyle}>
					<td className="text-right">{++index}</td>
					<td>{store.code}</td>
					<td>{store.name}</td>
					<td>{store.type}</td>
					<td>{store.priority}</td>
					<td>{store.address}</td>
					<td>{store.city.name}</td>
				</tr>
			);
		}

		let storeTable;
		if( storeRows.length > 0) {
			storeTable = (
				<table className="table table-striped table-bordered table-hover">
					<thead>
						<tr>
							<th className="text-right">#</th>
							<th>Code</th>
							<th>Name</th>
							<th>Type</th>
							<th>Priority</th>
							<th>Address</th>
							<th>City</th>
						</tr>
					</thead>
					<tbody>
						{storeRows}
					</tbody>
				</table>
			);
		} else {
			storeTable = (<Jumbotron heading="there are no stores here" para=""/>);
		}
		return storeTable;
	}
}

