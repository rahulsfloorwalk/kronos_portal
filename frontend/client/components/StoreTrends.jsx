import React, { Component } from 'react';
import { Link, hashHistory } from 'react-router';

import { pointerStyle } from '../../js/styles.js';

import moment from 'moment';
import { momentDateFormat }  from '../../config.js';

import Loading from '../../js/components/Loading.jsx';
import Jumbotron from '../../js/components/Jumbotron.jsx';
import { getColor, getAuditType } from '../../js/utils.js';
import { ChevronRight, ChevronDown, ShareAlt } from '../../js/components/Icons.jsx';

import { fetchStoreMarkingTrends } from '../service/store.js';
import { fetchAuditTypes } from '../service/dashboard.js';

export default class StoreTrends extends Component{
	constructor(props){
		super(props);
		this.state = {};
	}

	reloadReport = (storeId, audit_type) => {
		fetchStoreMarkingTrends(storeId, audit_type).then((data)=>{
			this.setState({
				data
			});
		});
	}

	componentDidMount() {
		fetchAuditTypes().then(types => {
			let audit_type = types.indexOf("WALKIN") > -1 ? "WALKIN" : types[0];

			this.setState({
				types,
				audit_type,
			});

			this.reloadReport(this.props.params.storeId, audit_type);
		});
	}

	auditTypeChanged = (e) => {
		this.reloadReport(this.props.params.storeId, e.target.value);
		this.setState({
			audit_type: e.target.value,
		});
	}

	render(){
		if(!this.state.data){
			return <Loading/>;
		}

		let rows = [];
		let prevSection;
		for(let score of this.state.data.scores) {
			if(score.scores.length === this.state.data.audit_cycle.length && score.max_marks > 0 ){
			rows.push(
				<tr key={score.question_id}>
					<td className="text-right">{prevSection !== score.section_name ? score.section_sequence : null}</td>
					<td>{prevSection !== score.section_name ? score.section_name : null}</td>
					<td>{score.question_txt}</td>
					{score.scores.map((s,i) => <td key={i} className={getColor(s.color) + " text-right"}>{s.marks}</td>)}
				</tr>
			);
			prevSection=score.section_name;
			}
		}

		let table;
		if( rows.length > 0) {
			let cycles = [];
			for(let ac of this.state.data.audit_cycle){
				cycles.push(<th key={ac} className="text-right">{ac}</th>);
			}
			table = (
				<table className="table table-striped table-bordered table-hover">
					<thead>
						<tr>
							<th className="text-right">#</th>
							<th>Section</th>
							<th>Question</th>
							{cycles}
						</tr>
					</thead>
					<tbody>
					{rows}
					</tbody>
				</table>
			);
		} else {
			table = (<Jumbotron heading="there is no data here" para=""/>);
		}
		return <div>
			<h3 className="page-header">
				Store Trends
				<div className="pull-right">
				<select className="form-control" value={this.state.audit_type} onChange={this.auditTypeChanged}>
				{this.state.types.map((type) => <option key={type} value={type}>{getAuditType(type)}</option>)}
				</select>
				</div>
			</h3>
			{table}
		</div>;
	}
}

