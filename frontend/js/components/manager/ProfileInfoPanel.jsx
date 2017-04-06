import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { fetchProfileInfoForAuditor } from '../../manager/actions/auditor.js'
import { fetchStates } from '../../manager_actions.js'
import { getGender, getEducationStatus, getMaritalStatus } from '../../utils.js';

import Loading from '../Loading.jsx';

var ProfileInfoPanel = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchProfileInfoForAuditor(this.props.auditorId));
		this.props.dispatch(fetchStates());
	},
	render: function(){
		if(! this.props.profileInfo){
			return <Loading/>;
		}
		var auditor_city = this.props.profileInfo.city || {};
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Profile Info</h3>
				</div>
				<div className="panel-body">
					<p>First Name: { this.props.profileInfo.first_name }</p>
					<p>Last Name: { this.props.profileInfo.last_name }</p>
					<p>Gender: { getGender(this.props.profileInfo.gender) }</p>
					<p>Education: { getEducationStatus(this.props.profileInfo.education) }</p>
					<p>Date of Birth: { moment(this.props.profileInfo.date_of_birth).format(momentDateFormat) }</p>
					<p>Marital Status: { getMaritalStatus(this.props.profileInfo.marital_status) }</p>
					<p>Address: { this.props.profileInfo.address }</p>
					<p>Mobile Number: <a href={`tel:${this.props.profileInfo.mobile_number}`}>{ this.props.profileInfo.mobile_number }</a></p>
					<p>City: { auditor_city.name }</p>
					<p>State: { auditor_city.state }</p>
					<p>Pincode: { this.props.profileInfo.pincode }</p>
				</div>
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		profileInfo: store.profileInfos[ownProps.auditorId],
		states: store.states
	};
};

export default ReactRedux.connect(mapStoreToProps)(ProfileInfoPanel);
