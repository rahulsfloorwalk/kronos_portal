import React, { Component } from "react";
import { hashHistory } from "react-router";

import { pointerStyle } from "../../styles.js";

import Jumbotron from "../../components/Jumbotron.jsx";

import { Download } from "../../components/Icons.jsx";

import DropDown from "../../components/DropDown.jsx";

import { fetchAllStores, fetchAuditCyclesYearList } from "../service/store.js";

import { url } from "../../../config.js";

import { getColor } from "../../utils.js";

import Loading from "../../components/Loading.jsx";

import StoreCodeSelector from "./store/StoreCodeSelector.jsx";

import CitySelectorForStoreFilter from "./store/CitySelectorForStoreFilter.jsx";

export default class StoreList2 extends Component{
	constructor(props){
		super(props);
		this.state = {
			stores: [],
			audit_cycles: [],
			loading: false,
			selectedCity: "",
			storeCode: "",
			percentFrom: "",
			percentTo: "",
			errMsg: ""
		};
	}

	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	};
	componentDidMount() {
		this.fetchStores();
		fetchAuditCyclesYearList().then((audit_cycles)=>{
			this.setState({
				audit_cycles
			});
		});
	}

	fetchStores = () =>{
		this.setLoading(true);
		fetchAllStores().then((stores)=>{
			stores.sort((a, b) => (a.get_store_rank===null)-(b.get_store_rank===null) || +(a.get_store_rank>b.get_store_rank)||-(a.get_store_rank<b.get_store_rank));
			this.setState({
				stores
			});
		}).always(() => this.setLoading(false));
	};

	changeValue = (e) => {
		if (e.target.name === "percentFrom" || e.target.name === "percentTo"){
			const re = /^[0-9\b]+$/;
			if (e.target.value === "" || re.test(e.target.value)) {
				this.setState({
					[e.target.name]: e.target.value,
					errMsg: ""
				});
			}
		}
		else{
			this.setState({
				[e.target.name]: e.target.value,
				errMsg: ""
			});
		}
	};

	filterStore = () => {
		const {selectedCity, storeCode, percentFrom, percentTo} = this.state;
		if (selectedCity === "" && storeCode === "" && percentFrom === "" && percentTo === ""){
			this.setState({
				errMsg : "Please enter or select value for filter"
			});
		}
		else if(percentFrom != "" || percentTo != ""){
			if(percentFrom === ""){
				document.getElementById("percentFrom").focus();
				this.setState({
					errMsg : "Please enter both values of percent field"
				});
			}
			else if(percentTo === ""){
				document.getElementById("percentTo").focus();
				this.setState({
					errMsg : "Please enter both values of percent field"
				});
			}
			// else{

			// }
		}
		// else{
		// }
	};

	resetFilter = () =>{
		const {selectedCity, storeCode, percentFrom, percentTo} = this.state;
		if(selectedCity != "" || storeCode != "" || percentFrom != "" || percentTo != ""){
			this.setState({
				storeCode: "",
				selectedCity: "",
				percentFrom : "",
				percentTo : "",
				errMsg: ""
			});
			this.fetchStores();
		}
	};

	render(){
		if(this.state.loading){
			return <Loading/>;
		}
		let citiesRows = [];
		let storeRows = [];
		let index = 0;
		let errSpan;
		for(let store of this.state.stores) {
			storeRows.push(
				<tr title="Click to open Store Details" key={store.id} onClick={() => hashHistory.push(`/store/${store.id}/trends`)} style={pointerStyle}>
					<td className="text-right">{++index}</td>
					<td>{store.code}</td>
					<td>{store.name}</td>
					{/* <td>{store.type}</td>
					<td>{store.priority}</td> */}
					<td>{store.address}</td>
					<td>{store.city.name}</td>
					<td>{store.get_store_rank === null ? "N/A" : store.get_store_rank}</td>
					<td className={getColor(store.get_total_percentage.color)}>{store.get_total_percentage.score === null ? "N/A" : store.get_total_percentage.score+"%" }</td>
				</tr>
			);
			if(citiesRows.filter(item => item.id == store.city.id).length === 0){
				citiesRows.push(
					{"id": store.city.id, "name": store.city.name}
				);
			}
		}
		citiesRows.sort((a, b) => (a.name > b.name) ? 1 : -1);
		let storeTable;
		let div_style = {
			paddingBottom:"1%"
		};
		const selectStyle = {
			display: "inline-block",
			width: "150px",
		};
		let audit_cycle_button = (null);
		if (this.state.audit_cycles["audit_cycle_status"]){
			var li_list = [];
			for(var i in this.state.audit_cycles["audit_cycle_year_list"]){
				let base_url = url.api_base_path+"client/audit_cycle_wise_xlsx_report?";
				base_url += "year=" + encodeURIComponent(this.state.audit_cycles["audit_cycle_year_list"][i] || "");
				li_list.push(<li key={i}>
					<a href={base_url}>
						<h5><b>{this.state.audit_cycles["audit_cycle_year_list"][i]}</b></h5>
					</a>
				</li>);
			}
			audit_cycle_button = (
				<div className="btn-group pull-right hidden-print" style={div_style}>
					&nbsp;Download:<br/>
					<button className="btn btn-default"
						title="Download Reports"
						onClick={() => this.reportDropdown && this.reportDropdown.toggle()}>
						<Download/> {this.state.audit_cycles["audit_cycle_year_list"].length} Audit Cycle Reports Year Wise &nbsp;
						<span className="caret"/>
					</button>
					<DropDown ref={(e) => this.reportDropdown = e}>
						{li_list}
					</DropDown>
				</div>
			);
		}
		if(this.state.errMsg){
			errSpan = (<span style={{color:"red"}}><b>{this.state.errMsg}</b></span>);
		}
		if( storeRows.length > 0) {
			storeTable = (
				<div className="form-group" style={{marginTop: "10px", verticalAlign: "middle"}}>
					<StoreCodeSelector name="storeCode" value={this.state.storeCode} onChange={this.changeValue}/>
					&nbsp;
					<CitySelectorForStoreFilter name="selectedCity" citiesRows={citiesRows} onChange={this.changeValue} selectedCity={this.state.selectedCity}/>
					&nbsp;
					<div style={{display: "inline-block",width: "80px",}}>
						&nbsp;<b>Percentage</b>:
						<input type="text" name="percentFrom" id="percentFrom" className="form-control" value={this.state.percentFrom} onChange={this.changeValue} maxLength="2"/>
					</div>
					&nbsp; to &nbsp;
					<div style={{display: "inline-block",width: "80px",}}>
						&nbsp;
						<input type="text" name="percentTo" id="percentTo" className="form-control" value={this.state.percentTo} onChange={this.changeValue} maxLength="3"/>
					</div>
					<div style={selectStyle}>
						&nbsp;&nbsp;
						<button className="btn btn-primary" onClick={this.filterStore}>Go</button>
						&nbsp;&nbsp;
						<button className="btn btn-primary" onClick={this.resetFilter}>Clear</button>
					</div>
					{errSpan}
					{audit_cycle_button}
					<table className="table table-striped table-bordered table-hover">
						<thead>
							<tr>
								<th className="text-right">#</th>
								<th>Code</th>
								<th>Name</th>
								{/* <th>Type</th>
								<th>Priority</th> */}
								<th>Address</th>
								<th>City</th>
								<th>Rank</th>
								<th>Total Score Till Date</th>
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

