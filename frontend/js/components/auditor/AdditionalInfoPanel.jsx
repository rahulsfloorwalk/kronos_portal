import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { Pencil } from '../Icons.jsx';

import { getHairColor, getCameraResolution } from '../../utils.js'
import { fetchAdditionalInfo } from '../../auditor/actions/additional_info.js'
import { Check, Cross } from '../Icons.jsx';
import LabelValue from '../LabelValue.jsx';

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
					<Link to="details/additional/edit" className="btn btn-default pull-right"><Pencil/> Edit</Link>
					<h4 className="">Additional Info</h4>
				</div>
				<table className="table table-striped">
					<tbody>
					<tr><td className="text-right text-muted" style={{"width":"40%"}}>Car Owned:</td><th>{ has_car }</th></tr>
					<tr><td className="text-right text-muted">Weekend Audit:</td><th>{ weekend_audit }</th></tr>
					<tr><td className="text-right text-muted">Hair Color:</td><th>{ getHairColor(this.props.additionalInfo.hair_color) }</th></tr>
					<tr><td className="text-right text-muted">Height (cm):</td><th>{ this.props.additionalInfo.height }</th></tr>
					<tr><td className="text-right text-muted">Weight (kg):</td><th>{ this.props.additionalInfo.weight }</th></tr>
					<tr><td className="text-right text-muted">Preferred Distance (km):</td><th>{ this.props.additionalInfo.distance }</th></tr>
					<tr><td className="text-right text-muted">Camera Owned:</td><th>{ camera_owned }</th></tr>
					<tr><td className="text-right text-muted">Camera Resolution:</td><th>{ getCameraResolution(this.props.additionalInfo.camera_resoulution) }</th></tr>
					<tr><td className="text-right text-muted">Laptop Owned:</td><th>{ laptop_owned }</th></tr>
					<tr><td className="text-right text-muted">Smart Phone Owned:</td><th>{ smart_phone_owned }</th></tr>
					</tbody>
				</table>
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
