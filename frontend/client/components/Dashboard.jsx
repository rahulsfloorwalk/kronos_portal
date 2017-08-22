import React from 'react';
import { hashHistory } from 'react-router';

import LatestAuditStore from './LatestAuditStore.jsx';
import AuditCycleCityMatrix from './AuditCycleCityMatrix.jsx';
import AuditCycleTimeSeries from './AuditCycleTimeSeries.jsx';
import AuditCycleStorePerformance from './AuditCycleStorePerformance.jsx';
import DashboardCityPerformanceChart from './DashboardCityPerformanceChart.jsx';
import FakeImpactFactor from './FakeImpactFactor.jsx';

import { Dashboard } from '../../js/components/Icons.jsx';

import Loading from '../../js/components/Loading.jsx';
import NavLink from '../../js/components/NavLink.jsx';
import AuditTypeLabel from '../../js/components/AuditTypeLabel.jsx';

import { fetchAuditTypes } from '../service/dashboard.js';

let TypedDashboard = React.createClass({
	componentDidMount: function(){
		//console.debug("TypedDashboard","componentDidMount", this.props.params.auditType);
	},
	componentWillReceiveProps: function(nextProps){
		//console.debug("TypedDashboard","componentWillReceiveProps", nextProps.params.auditType);
	},
	render: function(){
		return (
			<div>
				<AuditCycleTimeSeries auditType={this.props.params.auditType}/>
				<FakeImpactFactor auditType={this.props.params.auditType}/>
				<hr/>
				<AuditCycleStorePerformance auditType={this.props.params.auditType}/>
				<hr/>
				<DashboardCityPerformanceChart auditType={this.props.params.auditType}/>
				<hr/>
			{/*<div className="row">
				<div className="col-md-12">
					<AuditCycleCityMatrix auditType={this.props.params.auditType}/>
				</div>
			</div>*/}
			</div>
		);
	}
});

export default React.createClass({
	getInitialState: function(){
		return {
			types: []
		};
	},
	componentWillReceiveProps: function(nextProps){
		//console.debug("Dashboard","componentWillReceiveProps", nextProps.params.auditType);
	},
	componentDidMount: function(){
		//console.debug("Dashboard","componentDidMount", this.props.params.auditType);
		fetchAuditTypes().then(types => {
			this.setState({
				types
			});
			if( ! this.props.params.auditType){
				if( types.indexOf("WALKIN") > -1){
					hashHistory.push("/dashboard/WALKIN");
				} else {
					hashHistory.push(`/dashboard/${types[0]}`);
				}
			}
		});
	},
	render: function(){
		if(this.state.types.length === 0){
			return <Loading/>;
		}

		let tabStrip;

		if( this.state.types.length > 1){
			let typeLinks = [];
			for( let type of this.state.types){
				typeLinks.push(<NavLink key={type} to={`/dashboard/${type}`}><AuditTypeLabel auditType={type}/></NavLink>);
			}

			tabStrip = (<div className="nav nav-tabs nav-justified">
				{typeLinks}
			</div>);
		}

		return (
			<div>
				<h2 className="page-header"><Dashboard/> Dashboard</h2>
				{tabStrip}
				{this.props.children}
			</div>
		);
	},
});

export { TypedDashboard };
