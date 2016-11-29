import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchProfileInfo, fetchStates } from '../../auditor_actions.js'
import { getGender, getEducationStatus, getMaritalStatus } from '../../utils.js';
import LabelValue from '../LabelValue.jsx';

var ProfileInfoPanelBase = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchProfileInfo());
		this.props.dispatch(fetchStates());
	},
	render: function(){
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Personal Info</h3>
				</div>
				<div className="panel-body form-horizontal">
					<LabelValue label="First Name:" value={this.props.profileInfo.first_name}/>
					<LabelValue label="Last Name:" value={this.props.profileInfo.last_name}/>
					<LabelValue label="Gender:" value={getGender(this.props.profileInfo.gender)}/>
					<LabelValue label="Education:" value={getEducationStatus(this.props.profileInfo.education)}/>
					<LabelValue label="Date of Birth:" value={this.props.profileInfo.date_of_birth}/>
					<LabelValue label="Marital Status:" value={getMaritalStatus(this.props.profileInfo.marital_status)}/>
					<LabelValue label="Address:" value={this.props.profileInfo.address}/>
					<LabelValue label="Mobile Number:" value={this.props.profileInfo.mobile_number}/>
					<LabelValue label="City:" value={this.props.profileInfo.city}/>
					<LabelValue label="State:" value={this.props.profileInfo.state}/>
					<LabelValue label="Pincode:" value={this.props.profileInfo.pincode}/>
				</div>
				<div className="panel-footer text-right">
					<Link to="details/profile/edit" className="btn btn-default">EDIT</Link>
				</div>
			</div>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		profileInfo: store.profileInfo,
		states: store.states
	};
};

export { ProfileInfoPanelBase };
export default ReactRedux.connect(mapStoreToProps)(ProfileInfoPanelBase); 
