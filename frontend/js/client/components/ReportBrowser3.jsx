import React, { Component } from 'react';
import { Link, hashHistory } from 'react-router';
import Datetime from 'react-datetime';

import Loading from '../../components/Loading.jsx';
import Jumbotron from '../../components/Jumbotron.jsx';
import { Plus, File, Download } from '../../components/Icons.jsx';

import { pointerStyle }  from '../../styles.js';

import moment from 'moment';
import { momentDateFormat , url}  from '../../../config.js';
import { getAuditType, getColor } from '../../utils.js';

import StoreList from './StoreList.jsx';
import { AuditTypeIcon } from '../../components/AuditTypeLabel.jsx';

import { fetchAuditCycles } from '../service/audit_cycle.js';
import { fetchCities } from '../service/city.js';
import { findAuditStoresByAuditCycle } from '../service/audit_store.js';

export class AuditStoreTable extends Component {
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			reports: [],
			cities: [],
			types: [],
			priorities: [],
			months: [],
			selectedCityId: "",
			selectedType: "",
			selectedPriority: "",
			cycleStartDate: null,
			cycleEndDate: null,
			startDate: null,
			endDate: null,
		};
	}
	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	}
	reloadData = (auditCycleId, cycleStartDate, cycleEndDate) => {
		this.setLoading(true);
		findAuditStoresByAuditCycle(auditCycleId).then(reports => {
			let cities = [];
			let types = [];
			let priorities = [];
			let months = [];
			reports.forEach( r => {
				if(cities.filter(c => c.id === r.city_id).length === 0){
					cities.push({
						id: r.city_id,
						name: r.city_name,
					});
				}
				if(months.filter(m => m === new Date(r.audit_date).getMonth()).length === 0){
					months.push(new Date(r.audit_date).getMonth());
				}
				if( ! types.find(t => t === r.store_type)){
					types.push(r.store_type);
				}
				if( ! priorities.find(p => p === r.store_priority)){
					priorities.push(r.store_priority);
				}
			});
			this.setState({
				reports,
				cities,
				types,
				priorities,
				months,
				cycleStartDate: cycleStartDate,
				cycleEndDate: cycleEndDate,
				startDate: moment(cycleStartDate),
				endDate: moment(cycleEndDate),
			});
		}).always(() => this.setLoading(false));
	}

	createFilterUrl(){
		let base = url.api_base_path + 'client/audit_cycle/' + this.props.auditCycleId + '/audit_cycle_filtered_xlsx_report?';
		base += 'city=' + encodeURIComponent(this.state.selectedCityId || '') + '&';
		base += 'priority=' + encodeURIComponent(this.state.selectedPriority || '') + '&';
		base += 'start_date=' + encodeURIComponent(this.state.startDate.format("YYYY-MM-DD") || '') + '&';
		base += 'end_date=' + encodeURIComponent(this.state.endDate.format("YYYY-MM-DD") || '') + '&';
		base += 'type=' + encodeURIComponent(this.state.selectedType || '') + '&';
		base += 'month=' + encodeURIComponent(Number(this.state.selectedMonth)+1 || '');
		return base;
	}
	componentDidMount(){
		this.reloadData(this.props.auditCycleId, this.props.startDate, this.props.endDate);
	}
	componentWillReceiveProps(nextProps){
		if(this.props.auditCycleId !== nextProps.auditCycleId){
			this.reloadData(nextProps.auditCycleId, this.props.startDate, this.props.endDate);
		}
	}

	selectCity = (e) => {
		this.setState({
			selectedCityId: e.target.value,
		});
	}

	selectStorePriority = (e) => {
		this.setState({
			selectedPriority: e.target.value,
		});
	}

	selectStoreType = (e) => {
		this.setState({
			selectedType: e.target.value,
		});
	}

	selectMonth= (e) => {
		this.setState({
			selectedMonth: e.target.value,
		});
	}

	setStartDate= (date) => {
		this.setState({
			startDate: date,
		});
	}

	setEndDate= (date) => {
		this.setState({
			endDate: date,
		});
	}

	validateStartDate= (currentDate, selectedDate) => {
		return currentDate.isBetween(this.state.cycleStartDate, this.state.endDate, null, '[]');
	}

	validateEndDate= (currentDate, selectedDate) => {
		return currentDate.isBetween(this.state.startDate, this.state.cycleEndDate, null, '[]');
	}

	render(){
		if(this.state.loading){
			return (<Loading/>);
		}
		if(this.state.reports.length === 0) {
			return (<Jumbotron heading="there are no audits here" para="try changing audit cycle"/>);
		}
		let citySelect = (
			<div style={{display:"inline-block",width:"200px"}}>
				<label className="control-label">&nbsp;City:</label>
				<select onChange={this.selectCity} value={this.state.selectedCityId} className="form-control" style={{display:"inline-block",width:"200px"}}>
					<option value="">All Cities</option>
					{this.state.cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
				</select>
			</div>
		);

		let storeTypeSelect = (
			<div style={{display:"inline-block",width:"200px"}}>
				<label className="control-label">&nbsp;Store Type:</label>
				<select onChange={this.selectStoreType} value={this.state.selectedType} className="form-control" style={{display:"inline-block",width:"200px"}}>
				<option value="">All Types</option>
				{this.state.types.filter(t=>!!t).map(t => <option key={t} value={t}>{t}</option>)}
				</select>
			</div>
		);

		let startDatePicker = (
			<div style={{display:"inline-block",width:"200px"}}>
				<label className="control-label">&nbsp;Start Date:</label>
				<Datetime name="start_date"
					value={this.state.startDate}
					onChange={this.setStartDate}
					isValidDate={this.validateStartDate}
					timeFormat={false}
					dateFormat="YYYY-MM-DD"
					closeOnSelect={true}/>
			</div>
		);

		let endDatePicker = (
			<div style={{display:"inline-block",width:"200px"}}>
				<label className="control-label">&nbsp;End Date:</label>
				<Datetime name="end_date"
					value={this.state.endDate}
					onChange={this.setEndDate}
					isValidDate={this.validateEndDate}
					timeFormat={false}
					dateFormat="YYYY-MM-DD"
					closeOnSelect={true}/>
			</div>
		);

		let storePrioritySelect = (<select onChange={this.selectStorePriority} value={this.state.selectedPriority} className="form-control" style={{display:"inline-block",width:"200px"}}>
			<option value="">All Priorities</option>
			{this.state.priorities.filter(p=>!!p).map(p => <option key={p} value={p}>{p}</option>)}
		</select>);
		let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		let monthSelect = (<select onChange={this.selectMonth} value={this.state.selectedMonth} className="form-control" style={{display:"inline-block",width:"200px"}}>
			<option value="">All Months</option>
			{this.state.months.filter(m=>!!m).map(m => <option key={m} value={m}>{months[m]}</option>)}
		</select>);

		let headers = [];
		headers.push(<th key="store_code">Store Code</th>);
		headers.push(<th key="store_name">Name</th>);
		headers.push(<th key="date" className="text-right">Date</th>);
		headers = headers.concat(this.state.reports[0].sections.filter(s => s.max_marks > 0).map(s => <th key={s.sequence} className="text-right">{s.section}</th>));

		let trs = [];
		let previousStore;
		this.state.reports.filter(r => {
			return (this.state.selectedCityId ? r.city_id === parseInt(this.state.selectedCityId) : true)
			&& (this.state.selectedType ? r.store_type === this.state.selectedType : true)
			&& moment(r.audit_date).isBetween(this.state.startDate, this.state.endDate, null, '[]')
		}).forEach( r => {
			let tds = [];
			let storeName = previousStore === r.store_id ? "" : r.store_name;
			let cityName = previousStore === r.store_id ? "" : r.city_name;
			let storeCode = previousStore === r.store_id ? "" : r.store_code;
			let tdStyle = {};
			if(previousStore === r.store_id){
				//trs.push(<td colSpan={2 + tds.length}>&nbsp;</td>);
				tdStyle.borderTop = "solid White 0px";
			}
			if(previousStore !== r.store_id){
				//trs.push(<td colSpan={2 + tds.length}>&nbsp;</td>);
				tdStyle.borderTop = "solid lightgray 2px";
			}
			for(let s of r.sections){
				if(s.max_marks > 0){
					tds.push(<td key={s.sequence} className={getColor(s.color) + " text-right"} style={tdStyle}>{s.percentage === null ? "N/A" : s.percentage+"%" }</td>);
				}
			}
			trs.push(
				<tr key={r.audit_store_id} style={pointerStyle} onClick={()=> hashHistory.push(`/audit_store/${r.audit_store_id}`)}>
				<td className="">{storeCode}</td>
				<td style={tdStyle}>
					<b>{storeName}</b><br/>
					<small>{cityName}</small>
				</td>
				<td className="text-right" style={tdStyle}>{moment(r.audit_date).format(momentDateFormat)}</td>
				{tds}
				</tr>
			);
			previousStore = r.store_id;
		});
		var filteredUrl = this.createFilterUrl()
		return (
			<div>
			<div className="form-group">
				{citySelect}&nbsp;
				{storeTypeSelect}&nbsp;
				{startDatePicker}&nbsp;
				{endDatePicker}&nbsp;
				<span className="pull-right" style={{fontSize:"130%"}}>
					<big><b>{trs.length}</b> Reports</big>
					&nbsp;
					<a className="btn btn-default" href={filteredUrl}>
						<Download/> Download Excel
					</a>
				</span>
			</div>
			<div style={{ 'width': '100%', 'overflow': 'scroll'}}>
				<table className="table table-bordered table-hover">
				<thead>
					<tr>{headers}</tr>
				</thead>
				<tbody>
				{trs}
				</tbody>
				</table>
			</div>
			</div>
		);
	}
}

export default class ReportBrowser3 extends Component{
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			auditCycles: [],
		};
	}
	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	}
	componentDidMount() {
		fetchAuditCycles().then((auditCycles)=>{
			this.setState({
				auditCycles,
			})
			if( auditCycles.length > 0){
				this.auditCycleChanged(auditCycles[0].audit__audit_cycle__id);
			}
		});
	}
	auditCycleChanged = (auditCycleId) => {
		this.setState((prevState)=> {
			return Object.assign({}, prevState, {
				selectedAuditCycleId: auditCycleId,
			});
		});
	}

	render(){
		if(this.state.auditCycles.length === 0){
			return (<Jumbotron heading="there are no reports here" para="yet"/>);
		}
		if(! this.state.selectedAuditCycleId){
			return <Loading/>
		}
		var auditCycleRows = [];
		for(let ac of this.state.auditCycles) {
			auditCycleRows.push(<option value={ac.audit__audit_cycle__id} key={ac.audit__audit_cycle__id}>{ac.audit__audit_cycle__name}, {getAuditType(ac.audit__audit_cycle__type)}</option>);
		}

		let auditCycle = this.state.auditCycles.filter( ac => ac.audit__audit_cycle__id === parseInt(this.state.selectedAuditCycleId))[0] || {};
		return (
			<div>
				<h2 className="page-header">
					<AuditTypeIcon type={auditCycle.audit__audit_cycle__type}/> &nbsp;
					<select className="form-control input-lg" style={{width:"400px", display:"inline-block"}} name="audit_cycle" value={this.state.selectedAuditCycleId} onChange={(e) => this.auditCycleChanged(parseInt(e.target.value))}>
						{auditCycleRows}
					</select>
					<small> {moment(auditCycle.audit__audit_cycle__start_date).format("Do MMM")} to {moment(auditCycle.audit__audit_cycle__end_date).format("Do MMM")}</small>
				</h2>
				<AuditStoreTable auditCycleId={this.state.selectedAuditCycleId} startDate={auditCycle.audit__audit_cycle__start_date} endDate={auditCycle.audit__audit_cycle__end_date}/>
				{this.props.children}
			</div>
		);
	}
}
