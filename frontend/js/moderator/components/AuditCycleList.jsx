import React from 'react';
import { Link, hashHistory } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { pointerStyle }  from '../../styles.js';

import { findAuditCycles } from '../service/audit_cycle.js';

import { getAuditType, getAuditStatus } from '../../utils.js';

import { File } from '../../components/Icons.jsx';
import Jumbotron from '../../components/Jumbotron.jsx';

export default React.createClass({
	getInitialState: function(){
		return {
			auditCycles: []
		};
	},
	componentDidMount: function() {
		findAuditCycles().then((auditCycles) => {
			this.setState({
				auditCycles
			});
		});
	},
	render: function(){
		let trs = [];
		for(let ac of this.state.auditCycles) {
			trs.push(<tr key={ac.id}
					title="Click to view report"
					style={pointerStyle}
					onClick={()=>hashHistory.push(`audit_cycle/${ac.id}/audit_store`)}
				>
				<td>{ac.name}</td>
				<td>{ac.client.name}</td>
				<td>{getAuditType(ac.type)}</td>
			</tr>);
		}
		if(trs.length > 0){
			return (
				<div className="panel panel-default">
					<div className="panel-heading">
						<h4 className="panel-title">
							<File/> Audit Cycles
						</h4>
					</div>
					<table className="table table-bordered table-hover">
						<thead>
							<tr>
								<th>Cycle</th>
								<th>Client</th>
								<th>Type</th>
							</tr>
						</thead>
						<tbody>
							{trs}
						</tbody>
					</table>
				</div>
			);
		} else {
			return (<Jumbotron heading="no data here" para="assigned audit cycles will show up here"/>);
		}
	},
});

