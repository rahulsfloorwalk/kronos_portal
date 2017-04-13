import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchUser } from '../../auditor/actions/user.js';

import ProfileInfoPanel from './ProfileInfoPanel.jsx';
import BankInfoPanel from './BankInfoPanel.jsx';
import AdditionalInfoPanel from './AdditionalInfoPanel.jsx';

import Panel from '../Panel.jsx';

var DetailsPage = React.createClass({
	componentDidMount: function(){
		this.props.dispatch(fetchUser());
	},
	render: function(){
		return (
			<div className="row">
				<div className="col-md-6">
					<ProfileInfoPanel/>
					<Panel title="Account Details" body={true}>
						<p>Email: <b>{this.props.user.email}</b></p>
						<p>Mobile Number: <b>{this.props.profileInfo.mobile_number}</b></p>
						<p>Password: <a href="/auth/password_change">Click here</a> to change your password.</p>
						<p className="text-muted"><small>If you want to change your mobile number or email, please contact us.</small></p>
					</Panel>
				</div>
				<div className="col-md-6">
					<BankInfoPanel/>
					<AdditionalInfoPanel/>
				</div>
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		user: store.user || {},
		profileInfo: store.profileInfo || {}
	};
};

export default ReactRedux.connect(mapStoreToProps)(DetailsPage);
