import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import { getCameraResolution, getOccupation } from "../../utils.js";
import { fetchAdditionalInfo, saveAdditionalInfo } from "../actions/additional_info.js";

import FormInput from "../../components/FormInput.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import SaveButton from "../../components/SaveButton.jsx";
import Modal from "../../components/Modal.jsx";

import { additionalInfoPropType } from "../prop_types";

const errorList = PropTypes.arrayOf(PropTypes.string);

class AdditionalInfoForm extends React.Component {
	static propTypes = {
		errors: PropTypes.shape({
			occupation: errorList,
			distance: errorList,
			industry: errorList,
			company: errorList,
			has_car: errorList,
			car_model: errorList,
			car_cost: errorList,
			laptop_owned: errorList,
			laptop_model: errorList,
			camera_resoulution: errorList,
			mobile_model: errorList,
			mspa_code: errorList,
		}),
		additionalInfo: additionalInfoPropType,
		dispatch: PropTypes.func.isRequired,
	};
	state = {};

	componentWillMount() {
		this.setState(this.props.additionalInfo);
	}

	componentDidMount() {
		this.props.dispatch(fetchAdditionalInfo());
	}

	componentWillReceiveProps(nextProps) {
		this.setState(nextProps.additionalInfo);
	}

	inputChanged = (e) => {
		var change = {};
		if( e.target.type !== "checkbox"){
			change[e.target.name] = e.target.value;
		} else if(e.target.type === "checkbox"){
			change[e.target.name] = e.target.checked;
			if(!e.target.checked){
				switch(e.target.name){
				case "has_car":
					change["car_model"] = "";
					change["car_cost"] = 0;
					break;
				case "laptop_owned":
					change["laptop_model"] = "";
					break;
				default:
					break;
				}
			}
		}
		this.setState(change);
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.props.dispatch(saveAdditionalInfo(this.state));
	};

	render() {
		var laptop_option = {};
		var car_option = {};
		return (
			<Modal modalTitle="Edit Additional Info" onClose={hashHistory.goBack}>
				{/*<div className="form-group"><big><i>fields marked <b>✳</b> must be filled to apply to audits</i></big></div>*/}
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
							<FormInput label="Do you have a Car?" type="checkbox" checked={this.state.has_car} name="has_car" onChange={this.inputChanged} errors={this.props.errors.has_car}/>
						</div>
					</div>
					{ this.state.has_car ? <div className="row">
						<div className="col-sm-6">
							<FormInput label="Model of your Car" type="text" value={this.state.car_model} name="car_model" onChange={this.inputChanged} errors={this.props.errors.car_model} {...car_option}/>
						</div>
						<div className="col-sm-6">
							<FormInput label="Approx. price of car (INR)" min="0" max="10000000" step="100000" type="number" value={this.state.car_cost} name="car_cost" onChange={this.inputChanged} errors={this.props.errors.car_cost} {...car_option}/>
						</div>
					</div> : ""}
					<div className="row">
						<div className="col-sm-6">
							<FormInput label="Do you have a Laptop?" type="checkbox" checked={this.state.laptop_owned} name="laptop_owned" onChange={this.inputChanged} errors={this.props.errors.laptop_owned}/>
						</div>
						{ this.state.laptop_owned ? <div className="col-sm-6">
							<FormInput label="Model of your Laptop" type="text" value={this.state.laptop_model} name="laptop_model" onChange={this.inputChanged} errors={this.props.errors.laptop_model} {...laptop_option}/>
						</div> : ""}
					</div>
					<div className="row">
						<div className="col-sm-6">
							<FormInput label="Model of your Mobile" type="text" value={this.state.mobile_model} name="mobile_model" onChange={this.inputChanged} errors={this.props.errors.mobile_model}/>
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
							<FormInput label="MSPA certification code" type="text" value={this.state.mspa_code} name="mspa_code" onChange={this.inputChanged} errors={this.props.errors.mspa_code}/>
						</div>
					</div>
					<SaveButton/>
				</form>
			</Modal>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		additionalInfo: store.additionalInfo,
		errors: store.forms.additionalInfo.errors || {},
	};
};

export default ReactRedux.connect( mapStoreToProps)(AdditionalInfoForm);
