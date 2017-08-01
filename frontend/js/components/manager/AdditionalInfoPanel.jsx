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
		var is_complete = this.props.additionalInfo.is_complete ? "panel-success" : "panel-default";
		var has_car = this.props.additionalInfo.has_car ? <Check/> : <Cross/>;
		var weekend_audit = this.props.additionalInfo.weekend_audit ? <Check/> : <Cross/>;
		var camera_owned = this.props.additionalInfo.camera_owned ? <Check/> : <Cross/>;
		var smart_phone_owned = this.props.additionalInfo.smart_phone_owned ? <Check/> : <Cross/>;
		var laptop_owned = this.props.additionalInfo.laptop_owned ? <Check/> : <Cross/>;

		return (
			<div className={`panel ${is_complete}`}>
				<div className="panel-heading">
					<h3 className="panel-title">Additional Info</h3>
				</div>
				<div className="panel-body">
					<p>Referral Code: { this.props.additionalInfo.referral_code }</p>
					<p>Referred By: { this.props.additionalInfo.referred_by }</p>
					<p>Occupation: { getOccupation(this.props.additionalInfo.occupation) }</p>
					<p>Preferred Distance (km): { this.props.additionalInfo.distance }</p>
					<p>Industry: { this.props.additionalInfo.industry }</p>
					<p>Company: { this.props.additionalInfo.company }</p>
					<p>Car Owned: { has_car }</p>
					<p>Car Model: { this.props.additionalInfo.car_model }</p>
					<p>Car Cost: { this.props.additionalInfo.car_cost }</p>
					<p>Laptop Owned: { laptop_owned }</p>
					<p>Laptop Model: { this.props.additionalInfo.laptop_model }</p>
					<p>Mobile Model: { this.props.additionalInfo.mobile_model }</p>
					<p>Camera Resolution: { getCameraResolution(this.props.additionalInfo.camera_resoulution) }</p>
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
