import React, { Component } from 'react';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { Link, withRouter } from 'react-router';

import { ThumbsUp, ThumbsDown, User, Earphone, Calendar, ChevronDown, ChevronRight } from '../Icons.jsx';

import { findByAudit } from '../../manager/service/application.js';

import ApplicationStatusLabel from '../ApplicationStatusLabel.jsx';

class AuditApplicationList extends Component{
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			applications: [],
		};
	}
	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, { loading }));
	}
	reloadApplications = (auditId) => {
		this.setLoading(true);
		findByAudit(auditId).then((applications) => {
			this.setState({applications});
		}).always(()=>this.setLoading(false));
	}
	componentDidMount(){
		this.reloadApplications(this.props.auditId);
	}
	componentWillReceiveProps(nextProps){
		let t = nextProps.location.state && nextProps.location.state.t;
		if(this.props.auditId !== nextProps.auditId || (t && this.state.lastReloadAt !== t)){
			this.setState({lastReloadAt: t});
			this.reloadApplications(nextProps.auditId);
		}
	}
	render(){
		if(this.props.loading){
			return <Loading/>;
		}
		let rows = [];
		for( let app of this.state.applications){
			let auditorUrl = `/auditor/${app.profileinfo.user_id}`;
			let auditorLink = (<Link to={auditorUrl}>{app.profileinfo.first_name} { app.profileinfo.last_name}</Link>);
			let approveLink, rejectLink, statusLabel;
			if( app.status === "APPLIED"){
				approveLink = (<Link to={`${this.context.router.location.pathname}/${app.audit}/application/${app.id}/approve`} className="btn btn-primary"><ThumbsUp/> Approve</Link>);
				rejectLink = (<Link to={`${this.context.router.location.pathname}/${app.audit}/application/${app.id}/reject`} className="btn btn-default"><ThumbsDown/> Deny</Link>);
			} else {
				statusLabel = <ApplicationStatusLabel status={app.status}/>;
			}
			rows.push(
				<tr key={app.id} className="">
					<td><User/>&nbsp;{auditorLink}</td>
					<td><Earphone/>&nbsp;<a href={`tel:${app.profileinfo.mobile_number}`}>{app.profileinfo.mobile_number}</a></td>
					<td><Calendar/>&nbsp;{moment(app.audit_date).format(momentDateFormat)}</td>
					<td>
						{approveLink}&nbsp;{rejectLink}
						{statusLabel}
					</td>
				</tr>
			);
		}
		if(rows.length === 0){
			rows = <tr><td><div className="well well-sm col-md-offset-2 col-md-8 text-center text-muted">no applications for this audit</div></td></tr>;
		}
		return (
			<table className="table">
				<tbody>
				{rows}
				</tbody>
			</table>
		);
	}
}

AuditApplicationList.contextTypes = {
	auditCycleId: React.PropTypes.number,
	router: React.PropTypes.object,
}

export default withRouter(AuditApplicationList);
