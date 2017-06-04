import React from 'react';
import { Link, hashHistory } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../config.js';

import { findAuditCyclesByType } from '../service/audit_cycle.js';
import { fetchAuditCycleCityMatrix } from '../service/dashboard.js';

import { File } from '../../js/components/Icons.jsx';
import { getAuditType, getAuditStatus, getColor } from '../../js/utils.js';
import { LabelValue_2_10 } from '../../js/components/LabelValue.jsx';
import AuditStoreStatusLabel from '../../js/components/AuditStoreStatusLabel.jsx';
import Jumbotron from '../../js/components/Jumbotron.jsx';

var Row = React.createClass({
	render: function(){
		let sections = [];
		for(let s of this.props.row.sections){
			if(s.max_marks !== 0){
				sections.push(<td key={s.sequence} className={getColor(s.color) + " text-right"}>
					{s.percentage === null ? "N/A" : s.percentage+"%"}
				</td>);
			}
		}
		return (
			<tr title="Click to view report" style={{"cursor":"pointer"}}
					onClick={()=>hashHistory.push(`browser/auditCycle/${this.props.auditCycleId}/city/${this.props.row.city_id}`)}>
				<td>{this.props.row.city_name}</td>
				<td className="text-right">{this.props.row.audit_store_count}</td>
				{sections}
			</tr>
		);
	},
});

export default React.createClass({
	getInitialState: function(){
		return {
			auditCycles: [],
			report: [],
		};
	},
	reloadMatrix: function(auditCycleId){
		this.setState({
			selectedAuditCycleId: auditCycleId
		});
		fetchAuditCycleCityMatrix(auditCycleId).then((report) => {
			this.setState({
				report
			});
		});
	},
	reloadData: function(auditType){
		findAuditCyclesByType(auditType).then((auditCycles)=>{
			this.setState({
				auditCycles,
			});
			this.reloadMatrix(auditCycles[0].id);
		});
	},
	componentDidMount: function() {
		//console.debug("AuditCycleCityMatrix","componentDidMount", this.props.auditType);
		this.reloadData(this.props.auditType);
	},
	componentWillReceiveProps: function(nextProps){
		//console.debug("AuditCycleCityMatrix","componentWillReceiveProps", nextProps.auditType);
		this.reloadData(nextProps.auditType);
	},
	auditCycleChanged: function(e){
		this.reloadMatrix(e.target.value);
	},
	render: function(){

		var auditCycleRows = [];
		for(let id in this.state.auditCycles) {
			auditCycleRows.push(<option value={this.state.auditCycles[id].id} key={id}>{this.state.auditCycles[id].name}, {getAuditType(this.state.auditCycles[id].type)}</option>);
		}

		let trs = [];
		for(let row of this.state.report) {
			trs.push(<Row key={row.city_id} auditCycleId={this.state.selectedAuditCycleId} row={row}/>);
		}

		let displayTable;

		if(trs.length > 0){
			let sections = [];
			for(let s of this.state.report[0].sections){
				if(s.max_marks !== 0){
					sections.push(<th key={s.sequence}>{s.section}</th>);
				}
			}
			displayTable = (
					<table className="table table-bordered table-hover">
						<thead>
							<tr>
								<th>City</th>
								<th>No. of Reports</th>
								{sections}
							</tr>
						</thead>
						<tbody>
							{trs}
						</tbody>
					</table>
			);
		} else {
			displayTable = (<Jumbotron heading="no audits yet" para="latest audits will show up here"/>);
		}
		let selectedAuditCycle = this.state.auditCycles.filter((ac) => ac.id === parseInt(this.state.selectedAuditCycleId))[0];
		let totalsBox;
		if(selectedAuditCycle){
			totalsBox = (
			<div className="row">
				<div className="col-md-4">
						<div className="jumbotron text-center">
							<h1><b>{parseInt(selectedAuditCycle.completed_percentage)}<small>%</small></b></h1>
							<p className="text-muted">completed</p>
						</div>
				</div>
				<div className="col-md-4">
						<div className="jumbotron text-center">
							<h1><b>{selectedAuditCycle.completed_audit_count}</b></h1>
							<p className="text-muted">audits completed</p>
						</div>
				</div>
				<div className="col-md-4">
						<div className="jumbotron text-center">
							<h1><b>{selectedAuditCycle.audit_count}</b></h1>
							<p className="text-muted">total audits</p>
						</div>
				</div>
			</div>
			);
		}
		return (
			<div>
			<h4>
				<File/>
				<label className="control-label">Audit Cycle:</label>&nbsp;
				<select className="form-control" style={{width:"350px", display:"inline-block"}} value={this.state.selectedAuditCycleId} onChange={this.auditCycleChanged}>
					{auditCycleRows}
				</select>
			</h4>
				{totalsBox}
				{displayTable}
				{this.props.children}
			</div>
		);
	},
});

