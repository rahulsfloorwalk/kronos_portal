import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { fetchProfileInfo, saveProfileInfo } from '../../auditor_actions.js';

import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';

/**
 * Following are the props for a form:
 *
 * profileInfo - the initial data to be displayed
 * errors - errors in the form, if any
 */
var ProfileInfoForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentWillMount: function() {
		this.setState(this.props.profileInfo);
	},
	componentDidMount: function() {
		this.props.dispatch(fetchProfileInfo());
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState(nextProps.profileInfo);
	},
	inputChanged: function(e){
		var change = {};
		change[e.target.name] = e.target.value;
		this.setState(change);
	},
	onSubmit: function(e){
		e.preventDefault();
		this.props.dispatch(saveProfileInfo(this.state));
	},
	render : function(){
		return (
			<Modal modalTitle="Edit Profile Info" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<div className="row">
						<div className="col-md-6">
							<FormInput label="First Name" maxLength="20" type="text" value={this.state.first_name} name="first_name" onChange={this.inputChanged}/>
						</div>
						<div className="col-md-6">
							<FormInput label="Last Name" maxLength="20" type="text" value={this.state.last_name} name="last_name" onChange={this.inputChanged}/>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<FormInput label="Date of Birth" type="date" value={this.state.date_of_birth} name="date_of_birth" onChange={this.inputChanged} errors={this.props.errors.date_of_birth}/>
						</div>
						<div className="col-md-6">
							<FormGroup>
								<label>Gender</label>
								<select className="form-control" name="gender" value={this.state.gender} onChange={this.inputChanged}>
									<option value=""></option>
									<option value="M">Male</option>
									<option value="F">Female</option>
								</select>
							</FormGroup>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<FormGroup>
								<label>Marital Status</label>
								<select className="form-control" name="marital_status" value={this.state.marital_status} onChange={this.inputChanged}>
									<option value=""></option>
									<option value="S">Single</option>
									<option value="M">Married</option>
									<option value="D">Divorced</option>
									<option value="W">Widowed</option>
								</select>
							</FormGroup>
						</div>
						<div className="col-md-6">
							<FormGroup>
								<label>Education</label>
								<select className="form-control" name="education" value={this.state.education} onChange={this.inputChanged}>
									<option value=""></option>
									<option value="TE">10th (Middle School)</option>
									<option value="TW">12th (High School)</option>
									<option value="CO">In College</option>
									<option value="GR">Graduate</option>
									<option value="PG">Post Graduate and Above</option>
								</select>
							</FormGroup>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<FormInput label="Address" maxLength="100" type="text" value={this.state.address} name="address" onChange={this.inputChanged}/>
						</div>
						<div className="col-md-6">
							<FormInput label="Pincode" maxLength="8" type="text" value={this.state.pincode} name="pincode" onChange={this.inputChanged}/>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<FormInput label="City" maxLength="20" type="text" value={this.state.city} name="city" onChange={this.inputChanged}/>
						</div>
						<div className="col-md-6">
							<FormInput label="State" maxLength="20" type="text" value={this.state.state} name="state" onChange={this.inputChanged}/>
						</div>
					</div>
					<FormInput label="Mobile Number" maxLength="10" type="text" value={this.state.mobile_number} name="mobile_number" onChange={this.inputChanged}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		profileInfo: store.profileInfo,
		errors: store.forms.profileInfo.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(ProfileInfoForm);
