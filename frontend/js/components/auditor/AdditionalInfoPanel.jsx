import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { Pencil } from '../Icons.jsx';

import { getHairColor, getCameraResolution, getOccupation } from '../../utils.js'
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
					<tr><td className="text-right text-muted">Referral Code:</td><th>{ this.props.additionalInfo.referral_code }</th></tr>
					<tr><td className="text-right text-muted">Occupation:</td><th>{ getOccupation(this.props.additionalInfo.occupation) }</th></tr>
					<tr><td className="text-right text-muted">Preferred Distance (km):</td><th>{ this.props.additionalInfo.distance }</th></tr>
					<tr><td className="text-right text-muted">Industry:</td><th>{ this.props.additionalInfo.industry }</th></tr>
					<tr><td className="text-right text-muted">Company:</td><th>{ this.props.additionalInfo.company }</th></tr>
					<tr><td className="text-right text-muted">Car Model:</td><th>{ this.props.additionalInfo.car_model }</th></tr>
					<tr><td className="text-right text-muted">Cost of Car:</td><th>{ this.props.additionalInfo.car_cost }</th></tr>
					<tr><td className="text-right text-muted">Laptop Model:</td><th>{ this.props.additionalInfo.laptop_model }</th></tr>
					<tr><td className="text-right text-muted">Mobile Model:</td><th>{ this.props.additionalInfo.mobile_model }</th></tr>
					<tr><td className="text-right text-muted">Camera Resolution:</td><th>{ getCameraResolution(this.props.additionalInfo.camera_resoulution) }</th></tr>
					<tr><td className="text-right text-muted">MSPA Certification code:</td><th>{ this.props.additionalInfo.mspa_code }</th></tr>
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
