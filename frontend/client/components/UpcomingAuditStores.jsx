import React from 'react';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../config.js';

import { fetchUpcomingAuditStores } from '../service/audit_store.js';

import { Time } from '../../js/components/Icons.jsx';
import { getAuditType, getAuditStatus } from '../../js/utils.js';
import { LabelValue_2_10 } from '../../js/components/LabelValue.jsx';
import AuditTypeLabel from '../../js/components/AuditTypeLabel.jsx';
import AuditStoreStatusLabel from '../../js/components/AuditStoreStatusLabel.jsx';
import Jumbotron from '../../js/components/Jumbotron.jsx';

export default React.createClass({
	getInitialState: function(){
		return {
			groupedAuditStores: {}
		};
	},
	componentDidMount: function() {
		fetchUpcomingAuditStores().then((auditStores) => {
			let groupedAuditStores = {};
			auditStores.forEach( as => {
				if( ! groupedAuditStores[as.audit_date]){
					groupedAuditStores[as.audit_date] = [];
				}
				groupedAuditStores[as.audit_date].push(as);
			});
			this.setState({
				groupedAuditStores
			});
		});
	},
	render: function(){
		let rows = [];
		for(let key in this.state.groupedAuditStores) {
			let innerRows = [];

			for( let as of this.state.groupedAuditStores[key]){
				innerRows.push(
				<div className="row" key={as.id}>
					<div className="col-md-12"><br/></div>
					<div className="col-md-3">{as.audit.audit_cycle.name}</div>
					<div className="col-md-1">{as.audit.store.location.city.name}</div>
					<div className="col-md-6">
						{as.audit.store.name}<br/>
						<small className="text-muted">{as.audit.store.address}</small>
					</div>
					<div className="col-md-2"><AuditTypeLabel auditType={as.audit.audit_cycle.type}/></div>
				</div>
				);
			}

			rows.push(
				<div className="row" key={key}>
					<div className="col-md-12"><hr/></div>
					<div className="col-md-3">
					<h3>
						{moment(key).format(momentDateFormat)}
					</h3>
					</div>
					<div className="col-md-9">
						{innerRows}
						<div className="col-md-12"><br/></div>
					</div>
				</div>
			);
		}
		if(rows.length > 0){
			return (
				<div>
					<div className="row">
						<div className="col-md-3">
						<h3><Time/> Upcoming Audits</h3>
						</div>
						<div className="col-md-9">
							<div className="row">
								<div className="col-md-3"><h3>Audit Cycle</h3></div>
								<div className="col-md-1"><h3>City</h3></div>
								<div className="col-md-6"><h3>Store</h3></div>
								<div className="col-md-2"><h3>Audit Type</h3></div>
							</div>
						</div>
					</div>
					{rows}
					{this.props.children}
				</div>
			);
		} else {
			return (<Jumbotron heading="there are no upcoming audits right now" para=""/>);
		}
	},
});

