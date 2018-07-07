import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link, hashHistory } from 'react-router';

import Alert from 'react-s-alert';

import moment from 'moment';
import { momentDateFormat, url }  from '../../../../config.js';

import { fetchAuditor, activateAuditor, deactivateAuditor, verifyAuditor, setEmail, setMobileNumber, sendPasswordResetEmail } from '../../service/auditor.js';
import { Lock, Check, Envelope } from '../../../components/Icons.jsx';
import NavLink from '../../../components/NavLink.jsx';
import Panel from '../../../components/Panel.jsx';
import Loading from '../../../components/Loading.jsx';
import InPlaceEditable from '../../../components/InPlaceEditable.jsx';

export default class AuditorDetailsPage extends React.Component {
    state = {};

    goToFirstTab = (props) => {
		if(props.route && props.route.path === "auditor/:auditorId"){
			hashHistory.push(`/auditor/${props.params.auditorId}/details`);
		}
	};

    componentDidMount() {
		fetchAuditor(this.props.params.auditorId).done((auditor)=>this.setState({auditor}));
		this.goToFirstTab(this.props);
	}

    componentWillReceiveProps(nextProps) {
		if( this.props.params.auditorId !== nextProps.params.auditorId){
			fetchAuditor(nextProps.params.auditorId).done((auditor)=>this.setState({auditor}));
			this.goToFirstTab(nextProps);
		}
	}

    emailChanged = (newEmail) => {
		setEmail(this.props.params.auditorId, newEmail).then((auditor) =>{
			this.setState({auditor});
			Alert.success("EMAIL CHANGED");
		}, ()=>{
			Alert.warning("EMAIL INVALID");
		});
	};

    mobileNumberChanged = (newMobileNumber) => {
		setMobileNumber(this.props.params.auditorId, newMobileNumber).then((auditor)=>{
			this.setState({auditor});
			Alert.success("MOBILE NUMBER CHANGED");
		},()=>{
			Alert.warning("MOBILE NUMBER INVALID");
		});
	};

    sendPasswordResetEmail = () => {
		this.setState({passwordResetEmailLoading: true});
		sendPasswordResetEmail(this.props.params.auditorId).then((auditor)=>{
			this.setState({auditor});
			Alert.success("PASSWORD RESET EMAIL SENT");
		},()=>{
			Alert.warning("THERE WAS A PROBLEM");
		}).always(() => {
			this.setState({passwordResetEmailLoading: false});
		});
	};

    render() {
		if(! this.state.auditor){
			return <Loading/>;
		}
		let statusButton;
		if(this.state.auditor.is_active){
			statusButton = (<button onClick={() => deactivateAuditor(this.props.params.auditorId).then((auditor)=>{
				this.setState({auditor});
				Alert.success("AUDITOR DEACTIVATED")
			})}
				className="btn btn-default">
				<Lock/> Deactivate
			</button>);
		} else {
			statusButton = (<button onClick={() => activateAuditor(this.props.params.auditorId).then((auditor)=>{
				this.setState({auditor});
				Alert.success("AUDITOR ACTIVATED");
			})}
				className="btn btn-default">
				<Lock/> Activate
			</button>);
		}

		let verifyButton;
		if( ! this.state.auditor.verification.is_verified){
			verifyButton = (<button onClick={() => verifyAuditor(this.props.params.auditorId).then((auditor)=>{
				this.setState({auditor});
				Alert.success("AUDITOR VERIFIED");
			})}
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
						<h4><b>{this.state.auditor.email}</b></h4>
					</div>
					<table className="table">
						<tbody>
							<tr>
								<td className="text-right">Email Address:</td>
								<td>
									<InPlaceEditable inputText={this.state.auditor.email} onSave={this.emailChanged}><b>{ this.state.auditor.email }</b></InPlaceEditable>
								</td>
								<td className="text-right">Date Joined:</td>
								<td>
								<b>{ moment(this.state.auditor.date_joined).format(momentDateFormat) }</b>
								</td>
							</tr>
							<tr>
								<td className="text-right">Mobile Number:</td>
								<td>
								<InPlaceEditable inputText={this.state.auditor.profileinfo.mobile_number} onSave={this.mobileNumberChanged}>
								<b>{ this.state.auditor.profileinfo.mobile_number ?
									this.state.auditor.profileinfo.mobile_number
									: <span className="text-muted">update mobile number</span>
								}</b>
								</InPlaceEditable>
								</td>
								<td className="text-right">Last Login:</td>
								<td>
								<b>{ moment(this.state.auditor.last_login).format(momentDateFormat) }</b>
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
							<NavLink to={`/auditor/${this.props.params.auditorId}/referral`}>Referrals</NavLink>
							<NavLink to={`/auditor/${this.props.params.auditorId}/email_log`}>Email Log</NavLink>
						</ul>
						<br/>
						{this.props.children}
					</div>
				</div>
			</div>
		);
	}
}
