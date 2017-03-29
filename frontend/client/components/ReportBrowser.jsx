import React from 'react';
import { Link } from 'react-router';

import Jumbotron from '../../js/components/Jumbotron.jsx';
import { Plus, File } from '../../js/components/Icons.jsx';

import moment from 'moment';
import { momentDateFormat }  from '../../config.js';
import { getAuditType } from '../../js/utils.js';

import StoreList from './StoreList.jsx';

import { fetchAuditCycles } from '../service/audit_cycle.js';
import { fetchCities } from '../service/city.js';
import { fetchCitySectionAverageByAuditCycle } from '../service/report.js';

export default React.createClass({
	getInitialState: function(){
		return {
			auditCycles: [],
			cities: [],
			stores: [],
			selectedAuditCycleId: null,
			selectedCityId: null,
			chartData: []
		};
	},
	selectAuditCycleOrCity: function(auditCycleId, cityId){
		this.setState({
			stores: [],
			chartData: [],
			selectedAuditCycleId: auditCycleId,
			selectedCityId: cityId
		});
		if(auditCycleId && cityId){
			fetchCitySectionAverageByAuditCycle(auditCycleId, cityId).then((chartData)=>{
				this.setState({
					chartData
				});
				console.log("got data", chartData);
			});
		}
	},
	componentDidMount: function() {
		fetchAuditCycles().then((auditCycles)=>{
			this.setState({
				auditCycles,
			});
			this.selectAuditCycleOrCity(auditCycles[0].id, this.state.selectedCityId);
		});
		fetchCities().then((cities)=>{
			this.setState({
				cities,
			});
			this.selectAuditCycleOrCity(this.state.selectedAuditCycleId, cities[0].location__city__id,);
		});
	},
	auditCycleChanged: function(e){
		this.selectAuditCycleOrCity(e.target.value, this.state.selectedCityId);
	},
	cityChanged: function(e){
		this.selectAuditCycleOrCity(this.state.selectedAuditCycleId, e.target.value);
	},
	render: function(){
		var storeRows = [];
		for(let id in this.state.stores) {
			storeRows.push(<StoreRow store={this.state.stores[id]} key={id}/>);
		}

		var cityRows = [];
		for(let id in this.state.cities) {
			cityRows.push(<option value={this.state.cities[id].location__city__id} key={id}>{this.state.cities[id].location__city__name}</option>);
		}

		var auditCycleRows = [];
		for(let id in this.state.auditCycles) {
			auditCycleRows.push(<option value={this.state.auditCycles[id]} key={id}>{this.state.auditCycles[id].name}, {getAuditType(this.state.auditCycles[id].type)}</option>);
		}

		var storeTable;
		if( storeRows.length > 0) {
			storeTable = (<table className="table table-striped">
					<thead>
						<tr>
							<th>Name</th>
							<th>Address</th>
							<th>Location</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{storeRows}
					</tbody>
				</table>);
		} else {
			storeTable = (<Jumbotron heading="there are no stores here" para="contact site administrator"/>);
		}

		var chartRows = [];
		for(let i in this.state.chartData){
			var progressClass = "";
			switch(this.state.chartData[i].color){
				case 1:
					progressClass = "danger";
					break;
				case 2:
					progressClass = "warning";
					break;
				case 3:
					progressClass = "info";
					break;
				case 4:
					progressClass = "success";
					break;
			}

			if( this.state.chartData[i].max_marks !== 0){
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

		let auditCycle = this.state.auditCycles.filter( ac => ac.id === this.state.selectedAuditCycleId)[0] || {};
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
										<td className="text-right">Total Audits</td>
										<th>{auditCycle.audit_count}</th>
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

