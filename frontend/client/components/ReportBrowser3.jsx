import React, { Component } from 'react';
import { Link, hashHistory } from 'react-router';

import Loading from '../../js/components/Loading.jsx';
import Jumbotron from '../../js/components/Jumbotron.jsx';
import { Plus, File, Download } from '../../js/components/Icons.jsx';

import { pointerStyle }  from '../../js/styles.js';

import moment from 'moment';
import { momentDateFormat , url}  from '../../config.js';
import { getAuditType, getColor } from '../../js/utils.js';

import StoreList from './StoreList.jsx';
import { AuditTypeIcon } from '../../js/components/AuditTypeLabel.jsx';

import { fetchAuditCycles } from '../service/audit_cycle.js';
import { fetchCities } from '../service/city.js';
import { findAuditStoresByAuditCycle } from '../service/audit_store.js';

class AuditStoreTable extends Component {
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			reports: [],
		};
	}
	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	}
	reloadData = (auditCycleId) => {
		this.setLoading(true);
		findAuditStoresByAuditCycle(auditCycleId).then(reports => {
			this.setState({
				reports,
			});
		}).always(() => this.setLoading(false));
	}
	componentDidMount(){
		this.reloadData(this.props.auditCycleId);
	}
	componentWillReceiveProps(nextProps){
		if(this.props.auditCycleId !== nextProps.auditCycleId){
			this.reloadData(nextProps.auditCycleId);
		}
	}

	render(){
		if(this.state.loading){
			return (<Loading/>);
		}
		if(this.state.reports.length === 0) {
			return (<Jumbotron heading="there are no audits here" para="try changing audit cycle"/>);
		}
		let headers = [];
		headers.push(<th key="store_name">Store</th>);
		headers.push(<th key="date" className="text-right">Date</th>);
		headers = headers.concat(this.state.reports[0].sections.filter(s => s.max_marks > 0).map(s => <th key={s.sequence} className="text-right">{s.section}</th>));

		let trs = [];
		let previousStore;
		for(let r of this.state.reports){
			let tds = [];
			for(let s of r.sections){
				if(s.max_marks > 0){
					tds.push(<td key={s.sequence} className={getColor(s.color) + " text-right"} style={{}}>{s.percentage === null ? "N/A" : s.percentage+"%" }</td>);
				}
			}
			let storeName = previousStore === r.store_id ? "" : r.store_name;
			let cityName = previousStore === r.store_id ? "" : r.city_name;
			previousStore = r.store_id;
			trs.push(
				<tr key={r.audit_store_id} style={pointerStyle} onClick={()=> hashHistory.push(`/audit_store/${r.audit_store_id}`)}>
				<td>
					<b>{storeName}</b><br/>
					<small>{cityName}</small>
				</td>
				<td className="text-right">{moment(r.audit_date).format(momentDateFormat)}</td>
				{tds}
				</tr>
			);
		}

		return (
			<table className="table table-hover">
			<thead>
				<tr>{headers}</tr>
			</thead>
			<tbody>
			{trs}
			</tbody>
			</table>
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
			this.auditCycleChanged(auditCycles[0].id);
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
		var auditCycleRows = [];
		for(let id in this.state.auditCycles) {
			auditCycleRows.push(<option value={this.state.auditCycles[id].id} key={id}>{this.state.auditCycles[id].name}, {getAuditType(this.state.auditCycles[id].type)}</option>);
		}

		let auditCycle = this.state.auditCycles.filter( ac => ac.id === parseInt(this.state.selectedAuditCycleId))[0] || {};
		return (
			<div>
				<h2 className="page-header">
					<a className="btn btn-default pull-right" href={url.api_base_path + 'client/audit_cycle/' + auditCycle.id + '/audit_cycle_xlsx_report'}>
						<Download/> Download Excel
					</a>
					<AuditTypeIcon type={auditCycle.type}/> &nbsp;
					<select className="form-control input-lg" style={{width:"400px", display:"inline-block"}} name="audit_cycle" value={this.state.selectedAuditCycleId} onChange={(e) => this.auditCycleChanged(parseInt(e.target.value))}>
						{auditCycleRows}
					</select>
					<small> {moment(auditCycle.start_date).format("do MMM")} to {moment(auditCycle.end_date).format("Do MMM")}</small>
				</h2>
				<AuditStoreTable auditCycleId={this.state.selectedAuditCycleId}/>
				{this.props.children}
			</div>
		);
	}
}
