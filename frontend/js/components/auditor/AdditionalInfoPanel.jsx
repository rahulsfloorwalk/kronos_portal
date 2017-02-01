import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

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
					<h3 className="panel-title">Additional Info</h3>
				</div>
				<div className="panel-body form-horizontal">
					<LabelValue label="Has Car:" value={ has_car }/>
					<LabelValue label="Weekend Audit:" value={ weekend_audit }/>
					<LabelValue label="Hair Color:" value={ getHairColor(this.props.additionalInfo.hair_color) }/>
					<LabelValue label="Height (cm):" value={ this.props.additionalInfo.height }/>
					<LabelValue label="Weight (kg):" value={ this.props.additionalInfo.weight }/>
					<LabelValue label="Preferred Distance (km):" value={ this.props.additionalInfo.distance }/>
					<LabelValue label="Camera Owned:" value={ camera_owned }/>
					<LabelValue label="Camera Resolution:" value={ getCameraResolution(this.props.additionalInfo.camera_resoulution) }/>
					<LabelValue label="Laptop Owned:" value={ laptop_owned }/>
					<LabelValue label="Smart Phone Owned:" value={ smart_phone_owned }/>
				</div>
				<div className="panel-footer text-right">
					<Link to="details/additional/edit" className="btn btn-default">EDIT</Link>
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
