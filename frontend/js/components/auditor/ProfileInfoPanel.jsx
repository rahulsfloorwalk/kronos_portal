import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { pointerStyle } from '../../styles.js';

import moment from 'moment';

import { momentDateFormat }  from '../../../config.js';

import { Check, Warning, Pencil } from '../Icons.jsx';

import { fetchStates } from '../../auditor/actions/location_info.js'
import { fetchProfileInfo } from '../../auditor/actions/profile_info.js'
import { getGender, getEducationStatus, getMaritalStatus } from '../../utils.js';
import LabelValue from '../LabelValue.jsx';
import Loading from '../Loading.jsx'

var ProfileInfoPanelBase = React.createClass({
	getInitialState: function(){
		return {
			expanded: false,
		};
	},
	toggleExpand: function(){
		this.setState({expanded: !this.state.expanded});
	},
	componentDidMount: function() {
		this.props.dispatch(fetchProfileInfo());
		this.props.dispatch(fetchStates());
	},
	render: function(){
		if(!this.props.profileInfo.id){
			return <Loading/>;
		}

		var dateOfBirth;
		var date =  moment(this.props.profileInfo.date_of_birth);
		if (date.isValid()){
			dateOfBirth = date.format(momentDateFormat)
		}
		var auditorCity = this.props.profileInfo.city || {};

		let panelClass = "panel-default";

		if( ! this.props.profileInfo.is_complete && this.props.profileInfo.mobile_number){
			var completeWarning = (
				<div className="panel-footer">
					<p className="text-danger"><b>Please complete your personal information.</b></p>
				</div>
			);
		} else {
			panelClass = "panel-success-hoverable";
		}

		let panelIcon = this.props.profileInfo.is_complete ? <Check/> : <Warning/>;

		return (
			<div className={"panel " + panelClass}>
				<div className="panel-heading" style={pointerStyle} onClick={this.toggleExpand}>
					{ this.state.expanded || !this.props.profileInfo.is_complete ? <Link to="details/profile/edit" className="btn btn-default pull-right"><Pencil/> Edit</Link> : null }
					<h4>{panelIcon} Personal Information</h4>
				</div>
				{ this.state.expanded || !this.props.profileInfo.is_complete ?
				<table className="table table-striped">
					<colgroup>
						<col style={{width:"40%"}}/>
					</colgroup>
					<tbody>
					<tr><td className="text-muted text-right" style={{"width":"40%"}}>*First Name:</td><th>{this.props.profileInfo.first_name}</th></tr>
					<tr><td className="text-muted text-right">*Last Name:</td><th>{this.props.profileInfo.last_name}</th></tr>
					<tr><td className="text-muted text-right">*Gender:</td><th>{getGender(this.props.profileInfo.gender)}</th></tr>
					<tr><td className="text-muted text-right">*Education:</td><th>{getEducationStatus(this.props.profileInfo.education)}</th></tr>
					<tr><td className="text-muted text-right">*Date of Birth:</td><th>{dateOfBirth}</th></tr>
					<tr><td className="text-muted text-right">*Marital Status:</td><th>{getMaritalStatus(this.props.profileInfo.marital_status)}</th></tr>
					<tr><td className="text-muted text-right">*Address:</td><th>{this.props.profileInfo.address}</th></tr>
					<tr><td className="text-muted text-right">*City:</td><th>{auditorCity.name}</th></tr>
					<tr><td className="text-muted text-right">*State:</td><th>{auditorCity.state}</th></tr>
					<tr><td className="text-muted text-right">*Pincode:</td><th>{this.props.profileInfo.pincode}</th></tr>
					</tbody>
				</table>
				: null }
				{completeWarning}
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
