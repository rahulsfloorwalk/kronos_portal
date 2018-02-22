import React, { Component } from 'react';
import * as ReactRedux from 'react-redux';
import { hashHistory, Link } from 'react-router';

import moment from 'moment';
import { momentDateTimeFormat }  from '../../../../config.js';

import { fetchAuditor } from '../../service/auditor.js';
import { findEmailLogByEmail } from '../../service/email_log.js';

import { King, Retweet, Inbox, Tasks, Pencil, File } from '../../../components/Icons.jsx';
import Loading from '../../../components/Loading.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../../utils.js';

export default class AuditorEmailLog extends Component{
	constructor(props){
		super(props);
		this.state = {
			loading: true,
			emails: [],
		};
	}

	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	}

	reloadData = (auditorId) => {
		this.setLoading(true);
		fetchAuditor(auditorId).done((auditor)=>{
			findEmailLogByEmail(auditor.email).done((emails)=> {
				this.setState({ emails });
			}).always(() => this.setLoading(false));
		});
	}

	componentDidMount(){
		this.reloadData(this.props.params.auditorId);
	}

	render(){
		if( this.state.loading){
			return <Loading/>;
		}
		let emailRows = this.state.emails.map(e => {
			return (<tr key={e.id}>
				<td>{moment(e.sent_at).format(momentDateTimeFormat)}</td>
				<td>{e.subject}</td>
				<td><a href={`/manager/email_log/view/${e.id}/html`} className="btn btn-default" target="_blank">HTML</a></td>
				<td><a href={`/manager/email_log/view/${e.id}/text`} className="btn btn-default" target="_blank">TEXT</a></td>
			</tr>);
		});

		return (
			<div className="panel panel-default">
			<div className="panel-heading">
			<h4 className="panel-title">Email Logs</h4>
			</div>
			<table className="table table-striped table-hover">
			<tbody>
			<tr>
			<th>Time</th>
			<th>Subject</th>
			<th>HTML</th>
			<th>TEXT</th>
			</tr>
			{emailRows}
			</tbody>
			</table>
			</div>
		);
	}
}
