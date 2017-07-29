import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { getHairColor, getCameraResolution, getOccupation } from '../../utils.js'
import { fetchAdditionalInfoForAuditor } from '../../manager/actions/auditor.js'
import { Check, Cross } from '../Icons.jsx';
import Loading from '../Loading.jsx';

var AdditionalInfoPanel = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchAdditionalInfoForAuditor(this.props.auditorId));
	},
	render: function(){
		if(! this.props.additionalInfo){
			return <Loading/>;
		}
		var has_car = this.props.additionalInfo.has_car ? <Check/> : <Cross/>;
		var weekend_audit = this.props.additionalInfo.weekend_audit ? <Check/> : <Cross/>;
		var camera_owned = this.props.additionalInfo.camera_owned ? <Check/> : <Cross/>;
		var smart_phone_owned = this.props.additionalInfo.smart_phone_owned ? <Check/> : <Cross/>;
		var laptop_owned = this.props.additionalInfo.laptop_owned ? <Check/> : <Cross/>;

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Additional Info</h3>
				</div>
				<div className="panel-body">
					<p>Referral Code: { this.props.additionalInfo.referral_code }</p>
					<p>Referred By: { this.props.additionalInfo.referred_by }</p>
					<p>Occupation: { getOccupation(this.props.additionalInfo.occupation) }</p>
					<p>Car Owned: { has_car }</p>
					<p>Weekend Audit: { weekend_audit }</p>
					<p>Hair Color: { getHairColor(this.props.additionalInfo.hair_color) }</p>
					<p>Height (cm): { this.props.additionalInfo.height }</p>
					<p>Weight (kg): { this.props.additionalInfo.weight }</p>
					<p>Preferred Distance (km): { this.props.additionalInfo.distance }</p>
					<p>Camera Owned: { camera_owned }</p>
					<p>Camera Resolution: { getCameraResolution(this.props.additionalInfo.camera_resoulution) }</p>
					<p>Laptop Owned: { laptop_owned }</p>
					<p>Smart Phone Owned: { smart_phone_owned }</p>
				</div>
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		additionalInfo: store.additionalInfos[ownProps.auditorId]
	};
};

export default ReactRedux.connect(mapStoreToProps)(AdditionalInfoPanel);
