import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { fetchAuditStoreByAuditCycleAndStore } from '../service/audit_store.js';

import { File } from '../../components/Icons.jsx';
import { getAuditType, getAuditStatus } from '../../utils.js';
import { LabelValue_2_10 } from '../../components/LabelValue.jsx';
import AuditStoreStatusLabel from '../../components/AuditStoreStatusLabel.jsx';
import Jumbotron from '../../components/Jumbotron.jsx';

var AuditStoreRow = React.createClass({
	render: function(){
		return (
			<tr>
				<td>{this.props.auditStore.audit.store.name}</td>
				<td>{`${this.props.auditStore.audit.store.city.name}`}</td>
				<td>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</td>
				<td>{getAuditType(this.props.auditStore.audit.audit_cycle.type)}</td>
				<td><Link to={`/audit_store/${this.props.auditStore.id}`} className="btn btn-default">View</Link></td>
			</tr>
		);
	},
});

export default React.createClass({
	getInitialState: function(){
		return {
			auditStores: []
		};
	},
	componentDidMount: function() {
		fetchAuditStoreByAuditCycleAndStore(this.props.auditCycleId, this.props.storeId).then((auditStores) => {
			this.setState({
				auditStores: auditStores
			});
		});
	},
	render: function(){
		var rows = [];
		for(var id in this.state.auditStores) {
			rows.push(<AuditStoreRow auditStore={this.state.auditStores[id]} key={id}/>);
		}
		if(rows.length > 0){
			return (
				<div>
					<h2 className="page-header">
						<File/> Audit Reports
					</h2>
					<table className="table table-striped">
						<thead>
							<tr>
								<th>Store</th>
								<th>City</th>
								<th>Audit Date</th>
								<th>Type</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{rows}
						</tbody>
					</table>
					{this.props.children}
				</div>
			);
		} else {
			return (<Jumbotron heading="no audits for this store" para="only completed audits will show up here"/>);
		}
	},
});

