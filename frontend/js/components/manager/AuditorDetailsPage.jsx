import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat, url }  from '../../../config.js';

import { fetchAuditor, activateAuditor, deactivateAuditor, verifyAuditor } from '../../manager/actions/auditor.js';

import { Lock, Check } from '../Icons.jsx';
import NavLink from '../NavLink.jsx';
import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';

import ProfileInfoPanel from './ProfileInfoPanel.jsx';
import BankInfoPanel from './BankInfoPanel.jsx';
import AdditionalInfoPanel from './AdditionalInfoPanel.jsx';

var AuditorDetailsPage = React.createClass({
	componentDidMount: function(){
		this.props.dispatch(fetchAuditor(this.props.params.auditorId));
	},
	render: function(){
		if(! this.props.auditor){
			return <Loading/>;
		}
		let statusButton;
		if(this.props.auditor.is_active){
			statusButton = (<button onClick={() => this.props.dispatch(deactivateAuditor(this.props.params.auditorId))}
				className="btn btn-default">
				<Lock/> Deactivate
			</button>);
		} else {
			statusButton = (<button onClick={() => this.props.dispatch(activateAuditor(this.props.params.auditorId))}
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
				<Panel title="Account Details">
					<p className="pull-right">{verifyButton}&nbsp;{statusButton}</p>
					<p>Email Address: <b>{ this.props.auditor.email }</b></p>
					<p>Date Joined: <b>{ moment(this.props.auditor.date_joined).format(momentDateFormat) }</b></p>
					<p>Last Login: <b>{ moment(this.props.auditor.last_login).format(momentDateFormat) }</b></p>
				</Panel>
				<div className="row">
					<div className="col-md-4">
						<ProfileInfoPanel auditorId={this.props.params.auditorId}/>
					</div>
					<div className="col-md-4">
						<BankInfoPanel auditorId={this.props.params.auditorId}/>
					</div>
					<div className="col-md-4">
						<AdditionalInfoPanel auditorId={this.props.params.auditorId}/>
					</div>
				</div>
				<div className="row">
					<div className="col-md-12">
						<ul className="nav nav-tabs">
							<NavLink to={`/auditor/${this.props.params.auditorId}/applications`}>Applications</NavLink>
							<NavLink to={`/auditor/${this.props.params.auditorId}/reports`}>Reports</NavLink>
							<NavLink to={`/auditor/${this.props.params.auditorId}/payment`}>Payments</NavLink>
							<NavLink to={`/auditor/${this.props.params.auditorId}/email_log`}>Email Log</NavLink>
							<NavLink to={`/auditor/${this.props.params.auditorId}/id_proof`}>ID Proofs</NavLink>
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
