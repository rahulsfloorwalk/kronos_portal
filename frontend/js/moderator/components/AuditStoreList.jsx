import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link, hashHistory } from 'react-router';

import moment from 'moment';
import { momentDateFormat, url}  from '../../../config.js';

import { pointerStyle }  from '../../styles.js';

import { File, Download } from '../../components/Icons.jsx';
import Panel from '../../components/Panel.jsx';
import AuditStoreStatusLabel from '../../components/AuditStoreStatusLabel.jsx';

import { findByAuditCycleId } from '../service/audit_store.js';

import { getAuditStoreStatus } from '../../utils.js';

var AuditStoreRow = React.createClass({
  render: function(){
    let auditorPhoneLink = (<a href={`tel:${this.props.auditStore.user.profileinfo.mobile_number}`}>{this.props.auditStore.user.profileinfo.mobile_number}</a>);
    return(
      <tr style={pointerStyle} onClick={() => hashHistory.push(`/audit_store/${this.props.auditStore.id}/report`)}>
        <td><b>{this.props.auditStore.user.profileinfo.first_name} {this.props.auditStore.user.profileinfo.last_name}</b> ( {auditorPhoneLink})</td>
        <td>{this.props.auditStore.audit.store.city.name}</td>
        <td>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</td>
        <td><AuditStoreStatusLabel status={this.props.auditStore.status}/></td>
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
	componentDidMount: function(){
		findByAuditCycleId(this.props.params.auditCycleId).then((auditStores) => {
			this.setState({
				auditStores
			});
		});
	},
	render: function(){
		let reps = [];
		for(let as of this.state.auditStores){
			reps.push(<AuditStoreRow auditStore={as} key={as.id} />);
		}
		return(
			<div className="panel panel-default">
			<div className="panel-heading">
				<h4 className="panel-title">Reports</h4>
			</div>
			<table className="table table-hover table-striped">
				<thead>
					<tr>
					<th>Auditor Name</th>
					<th>City</th>
					<th>Audit Date</th>
					<th>Report Status</th>
					</tr>
				</thead>
				<tbody>
					{reps}
				</tbody>
			</table>
			</div>
		);
	},
});

