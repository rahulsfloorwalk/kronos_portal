import React from 'react';
import { Link, hashHistory } from 'react-router';

import Jumbotron from '../../js/components/Jumbotron.jsx';
import { Plus, File } from '../../js/components/Icons.jsx';

import moment from 'moment';
import { momentDateFormat }  from '../../config.js';
import { getAuditType, getColor } from '../../js/utils.js';

import StoreList from './StoreList.jsx';

import { fetchAuditCycles } from '../service/audit_cycle.js';
import { fetchCities } from '../service/city.js';
import { fetchCitySectionAverageByAuditCycle } from '../service/report.js';

export default React.createClass({
	getInitialState: function(){
		return {
			auditCycles: [],
			cities: [],
			selectedAuditCycleId: null,
			selectedCityId: null,
			chartData: []
		};
	},
	selectAuditCycleOrCity: function(auditCycleId, cityId){
		if(auditCycleId && cityId){
			this.setState({
				chartData: [],
				selectedAuditCycleId: auditCycleId,
				selectedCityId: cityId
			});
			fetchCitySectionAverageByAuditCycle(auditCycleId, cityId).then((chartData)=>{
				this.setState({
					chartData
				});
			});
		}
	},
	reloadFromParams: function(){
		if(this.props.params.auditCycleId && this.props.params.cityId){
			this.selectAuditCycleOrCity(this.props.params.auditCycleId, this.props.params.cityId);
		} else {
			if(this.state.auditCycles.length > 0 && this.state.cities.length > 0){
				hashHistory.push(`/browser/auditCycle/${this.state.auditCycles[0].id}/city/${this.state.cities[0].location__city__id}`);
			}
		}
	},
	componentDidMount: function() {
		fetchAuditCycles().then((auditCycles)=>{
			this.setState({
				auditCycles,
			}, this.reloadFromParams);
		});
		fetchCities().then((cities)=>{
			this.setState({
				cities,
			}, this.reloadFromParams);
		});
	},
	componentWillReceiveProps: function(nextProps){
		this.selectAuditCycleOrCity(nextProps.params.auditCycleId, nextProps.params.cityId);
	},
	auditCycleChanged: function(e){
		hashHistory.push(`/browser/auditCycle/${e.target.value}/city/${this.state.selectedCityId}`);
	},
	cityChanged: function(e){
		hashHistory.push(`/browser/auditCycle/${this.state.selectedAuditCycleId}/city/${e.target.value}`);
	},
	render: function(){
		var cityRows = [];
		for(let id in this.state.cities) {
			cityRows.push(<option value={this.state.cities[id].location__city__id} key={id}>{this.state.cities[id].location__city__name}</option>);
		}

		var auditCycleRows = [];
		for(let id in this.state.auditCycles) {
			auditCycleRows.push(<option value={this.state.auditCycles[id].id} key={id}>{this.state.auditCycles[id].name}, {getAuditType(this.state.auditCycles[id].type)}</option>);
		}

		var chartRows = [];
		for(let i in this.state.chartData){
			if( this.state.chartData[i].max_marks !== 0){
				let progressClass = getColor(this.state.chartData[i].color);
				chartRows.push(<div className="list-group-item" key={this.state.chartData[i].sequence}>
						<b>{this.state.chartData[i].section}</b>
						<div className="progress">
								<div className={"progress-bar " + "progress-bar-" + progressClass } style={{width: this.state.chartData[i].percentage + "%"}}>
							{this.state.chartData[i].percentage}%
							</div>
						</div>
					</div>);
			}
		}
		if( chartRows.length === 0){
			chartRows.push(<div key="empty" className="list-group-item text-muted text-center">no data here yet</div>);
		}

		let auditCycle = this.state.auditCycles.filter( ac => ac.id === parseInt(this.state.selectedAuditCycleId))[0] || {};
		let city = this.state.cities.filter( c => c.location__city__id === parseInt(this.state.selectedCityId))[0] || {};
		return (
			<div>
				<h3 className="page-header">
				<div className="">
					<label className="control-label">Audit Cycle:</label>&nbsp;
					<select className="form-control" style={{width:"350px", display:"inline-block"}} name="audit_cycle" value={this.state.selectedAuditCycleId} onChange={this.auditCycleChanged}>
						{auditCycleRows}
					</select>
					&nbsp;
					<label className="control-label">City:</label>&nbsp;
					<select className="form-control" style={{width:"150px", display:"inline-block"}} name="city" value={this.state.selectedCityId} onChange={this.cityChanged}>
						{cityRows}
					</select>
				</div>
				</h3>
				<div className="row">
					<div className="col-md-6">
						<div className="panel panel-primary">
							<div className="panel-heading">
								<h4 className="panel-title">Audit Cycle Details</h4>
							</div>
							<table className="table table-striped">
								<tbody>
									<tr>
										<td className="text-right">Cycle</td>
										<th>{auditCycle.name}</th>
									</tr>
									<tr>
										<td className="text-right">Start Date</td>
										<th>{moment(auditCycle.start_date).format(momentDateFormat)}</th>
									</tr>
									<tr>
										<td className="text-right">End Date</td>
										<th>{moment(auditCycle.end_date).format(momentDateFormat)}</th>
									</tr>
									<tr>
										<td className="text-right">Audit Type</td>
										<th>{getAuditType(auditCycle.type)}</th>
									</tr>
									<tr>
										<td className="text-right">Audits</td>
										<td>
											<b>{auditCycle.completed_audit_count}</b> completed out of <b>{auditCycle.audit_count}</b>
										</td>
									</tr>
									<tr>
										<td className="text-right">Completion Percentage</td>
										<th>{parseFloat(auditCycle.completed_percentage).toFixed(2)}%</th>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
					<div className="col-md-6">
						<div className="panel panel-default">
							<div className="panel-heading">
								<h4 className="panel-title">Average Score for <b>{city.location__city__name}</b></h4>
							</div>
							<div className="list-group">
								{chartRows}
							</div>
						</div>
					</div>
				</div>
				<StoreList auditCycleId={this.state.selectedAuditCycleId} cityId={this.state.selectedCityId} cityName={city.location__city__name}/>
				{this.props.children}
			</div>
		);
	},
});

