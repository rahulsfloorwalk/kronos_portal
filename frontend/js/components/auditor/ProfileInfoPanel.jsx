import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchProfileInfo } from '../auditor_actions.js'

var ProfileInfoPanelBase = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchProfileInfo());
	},
	render: function(){
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Profile Info</h3>
				</div>
				<div className="panel-body">
					<Link to="details/profile/edit" className="btn btn-default pull-right">EDIT</Link>
					<p>First Name: { this.props.profileInfo.first_name }</p>
					<p>Last Name: { this.props.profileInfo.last_name }</p>
					<p>Gender: { this.props.profileInfo.gender }</p>
					<p>Education: { this.props.profileInfo.education }</p>
					<p>Date of Birth: { this.props.profileInfo.date_of_birth }</p>
					<p>Marital Status: { this.props.profileInfo.marital_status }</p>
					<p>Address: { this.props.profileInfo.address }</p>
					<p>Mobile Number: { this.props.profileInfo.mobile_number }</p>
					<p>City: { this.props.profileInfo.city }</p>
					<p>State: { this.props.profileInfo.state }</p>
					<p>Pincode: { this.props.profileInfo.pincode }</p>
				</div>
			</div>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		profileInfo: store.profileInfo
	};
};

export { ProfileInfoPanelBase };
export default ReactRedux.connect(mapStoreToProps)(ProfileInfoPanelBase); 
