import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchAuditor, activateAuditor, deactivateAuditor, verifyAuditor } from '../../manager/actions/auditor.js';

import { Lock, Check } from '../Icons.jsx';
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
				<Panel title="Email">
					<p className="pull-right">{verifyButton}&nbsp;{statusButton}</p>
					<p>Email Address: { this.props.auditor.email }</p>
				</Panel>
				<ProfileInfoPanel auditorId={this.props.params.auditorId}/>
				<BankInfoPanel auditorId={this.props.params.auditorId}/>
				<AdditionalInfoPanel auditorId={this.props.params.auditorId}/>
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
