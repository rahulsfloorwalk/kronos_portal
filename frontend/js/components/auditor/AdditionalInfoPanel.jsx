import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { getHairColor, getCameraResolution } from '../../utils.js'
import { fetchAdditionalInfo } from '../../auditor_actions.js'
import { Check, Cross } from '../Icons.jsx';

var AdditionalInfoPanelBase = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchAdditionalInfo());
	},
	render: function(){
		var has_car = this.props.additionalInfo.has_car ? <Check/> : <Cross/>;
		var weekend_audit = this.props.additionalInfo.weekend_audit ? <Check/> : <Cross/>;
		var camera_owned = this.props.additionalInfo.camera_owned ? <Check/> : <Cross/>;
		var smart_phone_owned = this.props.additionalInfo.smart_phone_owned ? <Check/> : <Cross/>;
		var laptop_owned = this.props.additionalInfo.laptop_owned ? <Check/> : <Cross/>;

		var editButton = this.props.editButton ? <Link to="details/additional/edit" className="btn btn-default pull-right">EDIT</Link> : undefined;
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Additional Info</h3>
				</div>
				<div className="panel-body">
					<Link to="details/additional/edit" className="btn btn-default pull-right">EDIT</Link>
					<p>Has Car: { has_car }</p>
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

var mapStoreToProps = function(store){
	return {
		additionalInfo: store.additionalInfo
	};
};

export { AdditionalInfoPanelBase };
export default ReactRedux.connect(mapStoreToProps)(AdditionalInfoPanelBase); 
