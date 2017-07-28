import React, { Component } from 'react';
import * as ReactRedux from 'react-redux';
import { hashHistory, Link } from 'react-router';

import moment from 'moment';
import { momentDateTimeFormat }  from '../../../../config.js';

import { findEmailLogByEmail } from '../../../manager/service/email_log.js';

import { King, Retweet, Inbox, Tasks, Pencil, File } from '../../Icons.jsx';
import Loading from '../../Loading.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../../utils.js';

class AuditorEmailLog extends Component{
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

	reloadData = (email) => {
		this.setLoading(true);
		findEmailLogByEmail(this.props.auditor.email).then((emails)=> this.setState({ emails })).always(() => this.setLoading(false));
	}

	componentDidMount(){
		if(this.props.auditor){
			this.reloadData(this.props.auditor.email);
		}
	}

	componentWillReceiveProps = (nextProps) => {
		if(this.props.auditor){
			this.reloadData(nextProps.auditor.email);
		}
	}

	render(){
		if(! this.props.auditor || this.state.loading){
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
			<div className="row">
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
			</div>
		);
	}
}

let mapStoreToProps = function(store, ownProps){
	return {
		auditor: store.auditors[ownProps.params.auditorId]
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditorEmailLog);
