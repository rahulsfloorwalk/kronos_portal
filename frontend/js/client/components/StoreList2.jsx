import React, { Component } from "react";
import { hashHistory } from "react-router";

import { pointerStyle } from "../../styles.js";

import Jumbotron from "../../components/Jumbotron.jsx";

import { Download } from "../../components/Icons.jsx";

import DropDown from "../../components/DropDown.jsx";

import { fetchAllStores, fetchAuditCyclesYearList } from "../service/store.js";

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
		fetchAuditCyclesYearList().then((audit_cycles)=>{
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
		let div_style = {
			paddingBottom:'1%'
		};
		let audit_cycle_button = (null);
		if (this.state.audit_cycles['audit_cycle_status']){
			var li_list = [];
			for(var i in this.state.audit_cycles['audit_cycle_year_list']){
				let base_url = url.api_base_path+"client/audit_cycle_wise_xlsx_report?";
				base_url += "year=" + encodeURIComponent(this.state.audit_cycles['audit_cycle_year_list'][i] || "");
				li_list.push(<li key={i}>
					<a href={base_url}>
						<h5><b>{this.state.audit_cycles['audit_cycle_year_list'][i]}</b></h5>
					</a>
				</li>);
			};
			audit_cycle_button = (
				<div className="btn-group pull-right hidden-print" style={div_style}>
					&nbsp;Download:<br/>
					<button className="btn btn-default"
						title="Download Reports"
						onClick={() => this.reportDropdown && this.reportDropdown.toggle()}>
							<Download/> {this.state.audit_cycles['audit_cycle_year_list'].length} Audit Cycle Reports Year Wise &nbsp;
							<span className="caret"/>
					</button>
					<DropDown ref={(e) => this.reportDropdown = e}>
						{li_list}
					</DropDown>
				</div>
			);
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

