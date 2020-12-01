import React, { Component } from "react";
import { hashHistory } from "react-router";

import { pointerStyle } from "../../styles.js";

import Jumbotron from "../../components/Jumbotron.jsx";

import { Download } from "../../components/Icons.jsx";

import DropDown from "../../components/DropDown.jsx";

import { fetchAllStores, fetchAuditCyclesYearList, fetchFilterStores } from "../service/store.js";

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
			filterstores: [],
			citiesRows: [],
			audit_cycles: [],
			storeCount: "",
			loading: false,
			selectedCity: "",
			storeCode: "",
			percentFrom: "",
			percentTo: "",
			errMsg: "",
			loadMoreLoader: false
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
		let lastStoreId = "";
		fetchAllStores({lastStoreId}).then((stores)=>{
			// stores.sort((a, b) => (a.get_total_percentage["score"]===null)-(b.get_total_percentage["score"]===null) || +(a.get_total_percentage["score"] < b.get_total_percentage["score"])||-(a.get_total_percentage["score"] > b.get_total_percentage["score"]));
			// for (let i = 0; i < stores.length; i++) {
			// 	if(cityRows.filter(item => item.id == stores[i].city.id).length === 0){
			// 		cityRows.push(
			// 			{"id": stores[i].city.id, "name": stores[i].city.name}
			// 		);
			// 	}
			// 	cityRows.sort((a, b) => (a.name > b.name) ? 1 : -1);
			// }
			this.setState({
				stores: stores["stores_list"],
				citiesRows: stores["city_list"],
				storeCount: stores["store_count"],
				filterstores: []
			});
		}).always(() => this.setLoading(false));
	};

	fetchFilterStore = () => {
		const {selectedCity, storeCode, percentFrom, percentTo} = this.state;
		this.setLoading(true);
		fetchFilterStores(storeCode, selectedCity, percentFrom, percentTo).then((filterstores)=>{
			filterstores.sort((a, b) => (a.get_total_percentage["score"]===null)-(b.get_total_percentage["score"]===null) || +(a.get_total_percentage["score"] < b.get_total_percentage["score"])||-(a.get_total_percentage["score"] > b.get_total_percentage["score"]));
			this.setState({
				filterstores:filterstores,
				stores: []
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
				errMsg : "Please enter or select at least one value for filter"
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
			else{
				this.fetchFilterStore();
			}
		}
		else{
			this.fetchFilterStore();
		}
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

	loadMoreStores = () => {
		this.setState({
			loadMoreLoader: true
		});
		let lastStoreId = this.state.stores[this.state.stores.length-1].id;
		fetchAllStores({lastStoreId}).then((response) => {
			let newStores = this.state.stores;
			for(let stores of response.stores_list){
				newStores.push(stores);
			}
			this.setState({
				auditStores: newStores,
				loadMoreLoader: false
			});
		});
	};

	render(){
		if(this.state.loading){
			return <Loading/>;
		}
		let storeRows = [];
		let index = 0;
		let errSpan;
		let loadMoreButton;
		let loadMoreLoading;
		if(this.state.loadMoreLoader){
			loadMoreLoading = (<Loading/>);
		}
		if(this.state.stores.length > 0){
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
			}
			if(this.state.stores.length != this.state.storeCount){
				loadMoreButton = (<button className="btn btn-default" onClick={this.loadMoreStores}>
					Load More
				</button>);
			}
		}
		else{
			for(let store of this.state.filterstores) {
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
			}
		}
		let storeTable;
		const selectStyle = {
			display: "inline-block",
			width: "150px",
		};
		let audit_cycle_button;
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
				<div className="btn-group pull-right hidden-print">
					&nbsp;Download:<br/>
					<button className="btn btn-default"
						title="Download Store Score By Audit Cycle"
						onClick={() => this.reportDropdown && this.reportDropdown.toggle()}>
						<Download/> Audit Cycle Wise Store Score &nbsp;
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
		const { citiesRows } = this.state;
		if (storeRows.length > 0){
			storeTable = (
				<div>
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
					</div>
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
					<div className="text-center">
						{loadMoreLoading}
						{loadMoreButton}
					</div>
				</div>
			);
		}
		else {
			storeTable = (
				<div>
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
					</div>
					<Jumbotron heading="No stores found" para="Please try to change or clear filter"/>
				</div>
			);
		}
		return storeTable;
	}
}
