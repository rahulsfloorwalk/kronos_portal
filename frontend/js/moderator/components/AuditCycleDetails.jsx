import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { findAuditCycleById } from '../service/audit_cycle.js';

import ExpandableDetails from '../../components/ExpandableDetails.jsx';
import { King, Retweet, Inbox, Tasks, Pencil, File } from '../../components/Icons.jsx';
import NavLink from '../../components/NavLink.jsx';
import Panel from '../../components/Panel.jsx';
import Loading from '../../components/Loading.jsx';
import AuditTypeLabel from '../../components/AuditTypeLabel.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';


export default class extends React.Component {
    state = {
        auditCycle: null
    };

    componentDidMount() {
		findAuditCycleById(this.props.params.auditCycleId).then((auditCycle) => {
			this.setState({
				auditCycle
			});
		});
	}

    render() {
		if(! this.state.auditCycle){
			return <Loading/>;
		}

		let editAuditCycleLink = `/audit_cycle/${this.state.auditCycle.id}/edit`;
		let detailsElement = <ExpandableDetails details={this.state.auditCycle.description}/>;

		return (
			<div>
				<div className="row">
				<div className="col-md-4">
				<div className="panel panel-primary">
					<div className="panel-heading">
						<h4 className="panel-title"><Retweet/> Audit Cycle Details</h4>
					</div>
					<table className="table table-striped">
						<tbody>
							<tr><td className="text-right">Name:</td><td><b>{ this.state.auditCycle.name }</b></td></tr>
							<tr><td className="text-right">Client:</td><td><b>{ this.state.auditCycle.client.name }</b></td></tr>
							<tr><td className="text-right">Type:</td><td><b><AuditTypeLabel auditType={this.state.auditCycle.type}/></b></td></tr>
							<tr><td className="text-right">Status:</td><td><b>{ getAuditStatus(this.state.auditCycle.status) }</b></td></tr>
							<tr><td className="text-right">Start Date:</td><td><b>{ moment(this.state.auditCycle.start_date).format(momentDateFormat) }</b></td></tr>
							<tr><td className="text-right">End Date:</td><td><b>{ moment(this.state.auditCycle.end_date).format(momentDateFormat) }</b></td></tr>
							<tr><td className="text-right">Description</td><td>{ detailsElement }</td></tr>
						</tbody>
					</table>
				</div>
				</div>
				<div className="col-md-8">
				{this.props.children}
				</div>
				</div>
			</div>
		);
	}
}

