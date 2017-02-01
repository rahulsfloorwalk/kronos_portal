import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { getCameraResolution, getHairColor } from '../../utils.js';
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
							<FormInput label="Height (cm)" min="0" max="300" step="1" type="number" value={this.state.height} name="height" onChange={this.inputChanged} errors={this.props.errors.height}/>
						</div>
						<div className="col-sm-6">
							<FormInput label="Weight (kg)" min="0" max="300" step="1" type="number" value={this.state.weight} name="weight" onChange={this.inputChanged} errors={this.props.errors.weight}/>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-6">
							<FormInput label="Do you have a Car?" type="checkbox" checked={this.state.has_car} name="has_car" onChange={this.inputChanged} errors={this.props.errors.has_car}/>
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
							<FormInput label="Can you audit on a weekend?" type="checkbox" checked={this.state.weekend_audit} name="weekend_audit" onChange={this.inputChanged} errors={this.props.errors.weekend_audit}/>
						</div>
						<div className="col-sm-6">
							<FormSelect label="Your Hair Color" name="hair_color" value={this.state.hair_color} onChange={this.inputChanged} errors={this.props.errors.hair_color}>
								<option value=""></option>
								<option value="1">{ getHairColor("1") }</option>
								<option value="2">{ getHairColor("2") }</option>
								<option value="3">{ getHairColor("3") }</option>
								<option value="4">{ getHairColor("4") }</option>
								<option value="5">{ getHairColor("5") }</option>
								<option value="6">{ getHairColor("6") }</option>
								<option value="7">{ getHairColor("7") }</option>
								<option value="8">{ getHairColor("8") }</option>
							</FormSelect>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-6">
							<FormInput label="Do you own a camera?" type="checkbox" checked={this.state.camera_owned} name="camera_owned" onChange={this.inputChanged} errors={this.props.errors.camera_owned}/>
						</div>
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
					</div>
					<div className="row">
						<div className="col-sm-6">
							<FormInput label="Do you own a Laptop?" type="checkbox" checked={this.state.laptop_owned} name="laptop_owned" onChange={this.inputChanged} errors={this.props.errors.laptop_owned}/>
						</div>
						<div className="col-sm-6">
							<FormInput label="Do you own a Smart Phone?" type="checkbox" checked={this.state.smart_phone_owned} name="smart_phone_owned" onChange={this.inputChanged} errors={this.props.errors.smart_phone_owned}/>
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
