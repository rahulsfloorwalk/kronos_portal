import React from 'react';
import { Link, hashHistory } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../config.js';

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
					onClick={()=>hashHistory.push(`audit_store/${row[0]}`)}>
				<td>{this.props.row.city_name}</td>
				<td>{this.props.row.audit_store_count}</td>
				{sections}
			</tr>
		);
	},
});

export default React.createClass({
	getInitialState: function(){
		return {
			report: []
		};
	},
	componentDidMount: function() {
		fetchAuditCycleCityMatrix(3).then((report) => {
			this.setState({
				report
			});
		});
	},
	render: function(){
		let trs = [];
		for(let row of this.state.report) {
			trs.push(<Row key={row.city_id} row={row}/>);
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
							<File/> Latest Audit Cycle: ( {getAuditType(this.state.report.type)})
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

