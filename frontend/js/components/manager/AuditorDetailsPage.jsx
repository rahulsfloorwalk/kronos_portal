import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link, hashHistory } from 'react-router';

import Alert from 'react-s-alert';

import moment from 'moment';
import { momentDateFormat, url }  from '../../../config.js';

import { fetchAuditor, activateAuditor, deactivateAuditor, verifyAuditor, setEmail, setMobileNumber, sendPasswordResetEmail } from '../../manager/actions/auditor.js';

import { Lock, Check, Envelope } from '../Icons.jsx';
import NavLink from '../NavLink.jsx';
import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';
import InPlaceEditable from '../InPlaceEditable.jsx';

var AuditorDetailsPage = React.createClass({
	getInitialState: function(){
		return {};
	},
	goToFirstTab: function(props){
		if(props.route && props.route.path === "auditor/:auditorId"){
			hashHistory.push(`/auditor/${props.params.auditorId}/details`);
		}
	},
	componentDidMount: function(){
		this.props.dispatch(fetchAuditor(this.props.params.auditorId));
		this.goToFirstTab(this.props);
	},
	componentWillReceiveProps: function(nextProps){
		if( this.props.params.auditorId !== nextProps.params.auditorId){
			this.goToFirstTab(nextProps);
		}
	},
	emailChanged: function(newEmail){
		this.props.dispatch(setEmail(this.props.params.auditorId, newEmail)).then(() =>{
			Alert.success("EMAIL CHANGED");
		}, ()=>{
			Alert.warning("EMAIL INVALID");
		});
	},
	mobileNumberChanged: function(newMobileNumber){
		this.props.dispatch(setMobileNumber(this.props.params.auditorId, newMobileNumber)).then(()=>{
			Alert.success("MOBILE NUMBER CHANGED");
		},()=>{
			Alert.warning("MOBILE NUMBER INVALID");
		});
	},
	sendPasswordResetEmail: function(){
		this.setState({passwordResetEmailLoading: true});
		this.props.dispatch(sendPasswordResetEmail(this.props.params.auditorId)).then(()=>{
			Alert.success("PASSWORD RESET EMAIL SENT");
		},()=>{
			Alert.warning("THERE WAS A PROBLEM");
		}).always(() => {
			this.setState({passwordResetEmailLoading: false});
		});
	},
	render: function(){
		if(! this.props.auditor){
			return <Loading/>;
		}
		let statusButton;
		if(this.props.auditor.is_active){
			statusButton = (<button onClick={() => this.props.dispatch(deactivateAuditor(this.props.params.auditorId)).then(()=>Alert.success("AUDITOR DEACTIVATED"))}
				className="btn btn-default">
				<Lock/> Deactivate
			</button>);
		} else {
			statusButton = (<button onClick={() => this.props.dispatch(activateAuditor(this.props.params.auditorId)).then(()=>Alert.success("AUDITOR ACTIVATED"))}
				className="btn btn-default">
				<Lock/> Activate
			</button>);
		}

		let verifyButton;
		if( ! this.props.auditor.verification.is_verified){
			verifyButton = (<button onClick={() => this.props.dispatch(verifyAuditor(this.props.params.auditorId))}
				className="btn btn-success">
				<Check/> Verify
			</button>);
		}

		return (
			<div>
				<div className="panel panel-default">
					<div className="panel-heading">
						<span className="pull-right">
							<button onClick={this.sendPasswordResetEmail} className="btn btn-default" disabled={this.state.passwordResetEmailLoading}>
								<Envelope/> { this.state.passwordResetEmailLoading ? "sending email.." : "Reset Password" }
							</button>&nbsp;
							{verifyButton}&nbsp;{statusButton}
						</span>
						<h4><b>{this.props.auditor.email}</b></h4>
					</div>
					<table className="table">
						<tbody>
							<tr>
								<td className="text-right">Email Address:</td>
								<td>
									<InPlaceEditable inputText={this.props.auditor.email} onSave={this.emailChanged}><b>{ this.props.auditor.email }</b></InPlaceEditable>
								</td>
								<td className="text-right">Date Joined:</td>
								<td>
								<b>{ moment(this.props.auditor.date_joined).format(momentDateFormat) }</b>
								</td>
							</tr>
							<tr>
								<td className="text-right">Mobile Number:</td>
								<td>
								<InPlaceEditable inputText={this.props.auditor.profileinfo.mobile_number} onSave={this.mobileNumberChanged}>
								<b>{ this.props.auditor.profileinfo.mobile_number ?
									this.props.auditor.profileinfo.mobile_number 
									: <span className="text-muted">update mobile number</span>
								}</b>
								</InPlaceEditable>
								</td>
								<td className="text-right">Last Login:</td>
								<td>
								<b>{ moment(this.props.auditor.last_login).format(momentDateFormat) }</b>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div className="row">
					<div className="col-md-12">
						<ul className="nav nav-tabs">
							<NavLink to={`/auditor/${this.props.params.auditorId}/details`}>Details</NavLink>
							<NavLink to={`/auditor/${this.props.params.auditorId}/id_proof`}>ID Proofs</NavLink>
							<NavLink to={`/auditor/${this.props.params.auditorId}/applications`}>Applications</NavLink>
							<NavLink to={`/auditor/${this.props.params.auditorId}/reports`}>Reports</NavLink>
							<NavLink to={`/auditor/${this.props.params.auditorId}/payment`}>Payments</NavLink>
							<NavLink to={`/auditor/${this.props.params.auditorId}/email_log`}>Email Log</NavLink>
						</ul>
						<br/>
						{this.props.children}
					</div>
				</div>
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		auditor: store.auditors[ownProps.params.auditorId]
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditorDetailsPage);
