import React, { Component } from 'react';
import { Link, hashHistory } from 'react-router';

import { pointerStyle } from '../../styles.js';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import Loading from '../../components/Loading.jsx';
import Jumbotron from '../../components/Jumbotron.jsx';
import StorePerformance from './StorePerformance.jsx';

import { getColor, getAuditType } from '../../utils.js';
import { ChevronRight, ChevronDown, ShareAlt } from '../../components/Icons.jsx';

import { fetchStore, fetchStoreMarkingTrends } from '../service/store.js';
import { fetchAuditTypes } from '../service/dashboard.js';

export default class StoreTrends extends Component{
	constructor(props){
		super(props);
		this.state = {};
	}

	reloadReport = (storeId, audit_type=undefined) => {
		fetchStore(storeId).then((store)=>{
			if(!audit_type){
				switch(store.type){
					case "Fine Dine":
						audit_type = "FINE_DINE";
						break;
					case "Sky Karting":
						audit_type = "SKY_KARTING";
						break;
					case "Arena":
					case "":
					case undefined:
					case null:
					default:
						audit_type = "WALKIN";
						break;
				}
			}

			fetchStoreMarkingTrends(storeId, audit_type).then((data)=>{
				this.setState({
					data,
					audit_type,
				});
			});
		});
	}

	componentDidMount() {
		fetchAuditTypes().then(types => {
			//let audit_type = types.indexOf("WALKIN") > -1 ? "WALKIN" : types[0];

			this.setState({
				types,
				//audit_type,
			});

			this.reloadReport(this.props.params.storeId);
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
					{score.scores.map((s,i) => <td key={i} className={getColor(s.color) + " text-right"}>{parseFloat(s.marks) ? s.marks.toFixed(2) : s.marks}</td>)}
					<td className="text-right">{score.max_marks}</td>
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
							<th className="text-right">Max. Marks</th>
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
		return(
			<div>
				<h3 className="page-header">
					Store Performance
					<div className="pull-right">
					<select className="form-control input-lg" value={this.state.audit_type} onChange={this.auditTypeChanged}>
					{this.state.types.map((type) => <option key={type} value={type}>{getAuditType(type)}</option>)}
					</select>
					</div>
				</h3>
				<StorePerformance store_id={this.props.params.storeId} audit_type={this.state.audit_type}/>

				<h3 className="page-header">
					Score Performance Details
				</h3>
				{table}
			</div>
		)
	}
}
