import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { getCameraResolution, getHairColor, getOccupation } from '../../utils.js';
import { fetchAdditionalInfo, saveAdditionalInfo } from '../../auditor/actions/additional_info.js';

import FormInput from '../FormInput.jsx';
import FormSelect from '../FormSelect.jsx';
import FormGroup from '../FormGroup.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';

var AdditionalInfoForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentWillMount: function() {
		this.setState(this.props.additionalInfo);
	},
	componentDidMount: function() {
		this.props.dispatch(fetchAdditionalInfo());
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState(nextProps.additionalInfo);
	},
	inputChanged: function(e){
		var change = {};
		if( e.target.type !== "checkbox"){
			change[e.target.name] = e.target.value;
		} else if(e.target.type === "checkbox"){
			change[e.target.name] = e.target.checked;
		}
		this.setState(change);
	},
	onSubmit: function(e){
		e.preventDefault();
		this.props.dispatch(saveAdditionalInfo(this.state));
	},
	render : function(){
		return (
			<Modal modalTitle="Edit Additional Info" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<div className="row">
						<div className="col-sm-6">
							<FormSelect label="Occupation" value={this.state.occupation} name="occupation" onChange={this.inputChanged} errors={this.props.errors.occupation}>
								<option value=""></option>
								<option value="STUDENT">{getOccupation("STUDENT")}</option>
								<option value="SERVICE">{getOccupation("SERVICE")}</option>
								<option value="SELF_EMPLOYED">{getOccupation("SELF_EMPLOYED")}</option>
								<option value="BUSINESS">{getOccupation("BUSINESS")}</option>
								<option value="UNEMPLOYED">{getOccupation("UNEMPLOYED")}</option>
								<option value="RETIRED">{getOccupation("RETIRED")}</option>
							</FormSelect>
						</div>
						<div className="col-sm-6">
							<FormSelect label="Distance you can travel for an Audit" value={this.state.distance} name="distance" onChange={this.inputChanged} errors={this.props.errors.distance}>
								<option value=""></option>
								<option value="1">Upto 1 km</option>
								<option value="5">Upto 5 km</option>
								<option value="10">Upto 10 km</option>
								<option value="20">Upto 20 km</option>
								<option value="50">Upto 50 km</option>
								<option value="100">Upto 100 km</option>
							</FormSelect>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-6">
							<FormInput label="Industry" type="text" value={this.state.industry} name="industry" onChange={this.inputChanged} errors={this.props.errors.industry}/>
						</div>
						<div className="col-sm-6">
							<FormInput label="Company" type="text" value={this.state.company} name="company" onChange={this.inputChanged} errors={this.props.errors.company}/>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-6">
							<FormInput label="Model of your Car" type="text" value={this.state.car_model} name="car_model" onChange={this.inputChanged} errors={this.props.errors.car_model}/>
						</div>
						<div className="col-sm-6">
							<FormInput label="Approximate cost of your car (INR)" min="0" max="10000000" step="100000" type="number" value={this.state.car_cost} name="car_cost" onChange={this.inputChanged} errors={this.props.errors.car_cost}/>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-6">
							<FormInput label="Model of your Laptop" type="text" value={this.state.laptop_model} name="laptop_model" onChange={this.inputChanged} errors={this.props.errors.laptop_model}/>
						</div>
						<div className="col-sm-6">
							<FormInput label="Model of your Mobile" type="text" value={this.state.mobile_model} name="mobile_model" onChange={this.inputChanged} errors={this.props.errors.mobile_model}/>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-6">
							<FormSelect label="Camera Resolution" value={this.state.camera_resoulution} name="camera_resoulution" onChange={this.inputChanged} errors={this.props.errors.camera_resoulution}>
								<option value=""></option>
								<option value="1">{ getCameraResolution("1") }</option>
								<option value="2">{ getCameraResolution("2") }</option>
								<option value="3">{ getCameraResolution("3") }</option>
								<option value="4">{ getCameraResolution("4") }</option>
								<option value="5">{ getCameraResolution("5") }</option>
								<option value="6">{ getCameraResolution("6") }</option>
							</FormSelect>
						</div>
						<div className="col-sm-6">
							<FormInput label="MSPA certification code" type="text" value={this.state.mspa_code} name="mspa_code" onChange={this.inputChanged} errors={this.props.errors.mspa_code}/>
						</div>
					</div>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		additionalInfo: store.additionalInfo,
		errors: store.forms.additionalInfo.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(AdditionalInfoForm);
