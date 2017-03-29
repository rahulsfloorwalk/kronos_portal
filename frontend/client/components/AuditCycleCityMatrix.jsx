import React from 'react';
import { Link, hashHistory } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../config.js';

import { fetchAuditCycles } from '../service/audit_cycle.js';
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
				sections.push(<td key={s.sequence} className={getColor(s.color) + " text-right"}>{s.percentage}%</td>);
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
		fetchAuditCycleCityMatrix(auditCycleId).then((report) => {
			this.setState({
				report
			});
		});
	},
	componentDidMount: function() {
		fetchAuditCycles().then((auditCycles)=>{
			this.setState({
				auditCycles,
			});
			if(this.props.auditCycleId){
				this.reloadMatrix(this.props.auditCycleId);
			} else {
				hashHistory.push(`/dashboard/${auditCycles[0].id}`);
			}
		});
	},
	componentWillReceiveProps: function(nextProps){
		if( nextProps.auditCycleId){
			this.reloadMatrix(nextProps.auditCycleId);
		}
	},
	auditCycleChanged: function(e){
		hashHistory.push(`/dashboard/${e.target.value}`);
	},
	render: function(){

		var auditCycleRows = [];
		for(let id in this.state.auditCycles) {
			auditCycleRows.push(<option value={this.state.auditCycles[id]} key={id}>{this.state.auditCycles[id].name}, {getAuditType(this.state.auditCycles[id].type)}</option>);
		}

		let trs = [];
		for(let row of this.state.report) {
			trs.push(<Row key={row.city_id} auditCycleId={3} row={row}/>);
		}

		if(trs.length > 0){
			let sections = [];
			for(let s of this.state.report[0].sections){
				if(s.max_marks !== 0){
					sections.push(<th key={s.sequence}>{s.section}</th>);
				}
			}

			return (
				<div className="panel panel-default">
					<div className="panel-heading">
						<h4 className="panel-title">
							<File/> 
							<label className="control-label">Audit Cycle:</label>&nbsp;
							<select className="form-control" style={{width:"350px", display:"inline-block"}} value={this.props.auditCycleId} onChange={this.auditCycleChanged}>
								{auditCycleRows}
							</select>
						</h4>
					</div>
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
					{this.props.children}
				</div>
			);
		} else {
			return (<Jumbotron heading="no audits yet" para="latest audits will show up here"/>);
		}
	},
});

