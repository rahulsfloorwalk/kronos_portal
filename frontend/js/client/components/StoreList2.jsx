import React, { Component } from "react";
import { hashHistory } from "react-router";

import { pointerStyle } from "../../styles.js";

import Jumbotron from "../../components/Jumbotron.jsx";

import { fetchAllStores, fetchAuditCycles } from "../service/store.js";

import { url } from "../../../config.js";

export default class StoreList2 extends Component{
	constructor(props){
		super(props);
		this.state = {
			stores: [],
			audit_cycles: [],
		};
	}
	componentDidMount() {
		fetchAllStores().then((stores)=>{
			this.setState({
				stores
			});
		});
		fetchAuditCycles().then((audit_cycles)=>{
			this.setState({
				audit_cycles
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
		let base_url = url.api_base_path+"client/audit_cycle_wise_xlsx_report";
		let div_style = {
			paddingBottom:'1%'
		};
		let audit_cycle_button = (null);
		for (var au of this.state.audit_cycles){
			if (au['status'] == 'CLEARING' || au['status'] == 'ARCHIVED'){
				audit_cycle_button = (
						<div className="btn-group pull-right hidden-print" style={div_style}>
							<a className="btn btn-default" href={base_url}>
								<b>Audit Cycle Report</b>
							</a>
						</div>
				);
				break;
			}
		}
		if( storeRows.length > 0) {
			storeTable = (
				<div>
					{audit_cycle_button}
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
				</div>
			);
		} else {
			storeTable = (<Jumbotron heading="there are no stores here" para=""/>);
		}
		return storeTable;
	}
}

