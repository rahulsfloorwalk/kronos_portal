import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";
import Select from "react-select";

import { getCameraResolution, getOccupation, getIncomeText, getCarCost, getIndustry, getInterestArea } from "../../utils.js";
import { fetchAdditionalInfo, saveAdditionalInfo } from "../actions/additional_info.js";

import FormInput from "../../components/FormInput.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import SaveButton from "../../components/SaveButton.jsx";
import Modal from "../../components/Modal.jsx";

import { additionalInfoPropType } from "../prop_types";
import { InterestAreaList } from "../../constants.js";

const errorList = PropTypes.arrayOf(PropTypes.string);

class AdditionalInfoForm extends React.Component {
	static propTypes = {
		errors: PropTypes.shape({
			occupation: errorList,
			income: errorList,
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
	state = {
		interest_area: [],
		interestArea: null,
	};

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
					change["car_cost"] = "";
					break;
				case "laptop_owned":
					change["laptop_model"] = "";
					break;
				default:
					break;
				}
			}
		}
		if(e.target.name == "occupation"){
			if(e.target.value == "STUDENT"){
				change["income"] = 0;
			}
		}
		this.setState(change);
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.props.dispatch(saveAdditionalInfo(this.state));
	};

	handleChange = (interestArea) => {
		let interest_list = interestArea.map(value=>value.value);
		this.setState({
			interestArea: interestArea,
			interest_area: interest_list
		});
	};

	render() {
		var laptop_option = {};
		var car_option = {};
		const options = [];

		for(let option of InterestAreaList){
			options.push({
				label: getInterestArea(option),
				value: option
			});
		}
		return (
			<Modal modalTitle="Edit Additional Info" onClose={hashHistory.goBack}>
				{/*<div className="form-group"><big><i>fields marked <b>✳</b> must be filled to apply to audits</i></big></div>*/}
				<form onSubmit={this.onSubmit}>
					<div className="row">
						<div className="col-sm-6">
							<FormSelect label="Occupation" required_mark={true} value={this.state.occupation} name="occupation" onChange={this.inputChanged} errors={this.props.errors.occupation}>
								<option value=""></option>
								<option value="STUDENT">{getOccupation("STUDENT")}</option>
								<option value="SERVICE">{getOccupation("SERVICE")}</option>
								<option value="SELF_EMPLOYED">{getOccupation("SELF_EMPLOYED")}</option>
								<option value="BUSINESS">{getOccupation("BUSINESS")}</option>
								<option value="UNEMPLOYED">{getOccupation("UNEMPLOYED")}</option>
								<option value="RETIRED">{getOccupation("RETIRED")}</option>
							</FormSelect>
						</div>
						{this.state.occupation != "STUDENT" ?
							<div className="col-sm-6">
								<FormSelect label="Income" required_mark={true} value={this.state.income} name="income" onChange={this.inputChanged} errors={this.props.errors.income}>
									<option value=""></option>
									<option value="0">{getIncomeText("0")}</option>
									<option value="1">{getIncomeText("1")}</option>
									<option value="2">{getIncomeText("2")}</option>
									<option value="3">{getIncomeText("3")}</option>
									<option value="4">{getIncomeText("4")}</option>
									<option value="5">{getIncomeText("5")}</option>
								</FormSelect>
							</div>
							: null }
						<div className="col-sm-6">
							<FormSelect label="Distance you can travel for an Audit" required_mark={true} value={this.state.distance} name="distance" onChange={this.inputChanged} errors={this.props.errors.distance}>
								<option value=""></option>
								<option value="1">Upto 1 km</option>
								<option value="5">Upto 5 km</option>
								<option value="10">Upto 10 km</option>
								<option value="20">Upto 20 km</option>
								<option value="50">Upto 50 km</option>
								<option value="100">Upto 100 km</option>
							</FormSelect>
						</div>
						<div className="col-sm-6">
							<FormSelect label="Industry" required_mark={true} value={this.state.industry} name="industry" onChange={this.inputChanged} errors={this.props.errors.industry}>
								<option value=""></option>
								<option value="1">{getIndustry("1")}</option>
								<option value="2">{getIndustry("2")}</option>
								<option value="3">{getIndustry("3")}</option>
								<option value="4">{getIndustry("4")}</option>
								<option value="5">{getIndustry("5")}</option>
								<option value="6">{getIndustry("6")}</option>
								<option value="7">{getIndustry("7")}</option>
								<option value="8">{getIndustry("8")}</option>
								<option value="9">{getIndustry("9")}</option>
								<option value="10">{getIndustry("10")}</option>
								<option value="11">{getIndustry("11")}</option>
								<option value="12">{getIndustry("12")}</option>
								<option value="13">{getIndustry("13")}</option>
								<option value="14">{getIndustry("14")}</option>
								<option value="15">{getIndustry("15")}</option>
								<option value="16">{getIndustry("16")}</option>
								<option value="17">{getIndustry("17")}</option>
								<option value="18">{getIndustry("18")}</option>
								<option value="19">{getIndustry("19")}</option>
								<option value="20">{getIndustry("20")}</option>
								<option value="21">{getIndustry("21")}</option>
								<option value="22">{getIndustry("22")}</option>
								<option value="23">{getIndustry("23")}</option>
								<option value="24">{getIndustry("24")}</option>
								<option value="25">{getIndustry("25")}</option>
								<option value="26">{getIndustry("26")}</option>
								<option value="27">{getIndustry("27")}</option>
								<option value="28">{getIndustry("28")}</option>
								<option value="29">{getIndustry("29")}</option>
								<option value="30">{getIndustry("30")}</option>
								<option value="31">{getIndustry("31")}</option>
								<option value="32">{getIndustry("32")}</option>
								<option value="33">{getIndustry("33")}</option>
								<option value="34">{getIndustry("34")}</option>
								<option value="35">{getIndustry("35")}</option>
								<option value="36">{getIndustry("36")}</option>
								<option value="37">{getIndustry("37")}</option>
								<option value="38">{getIndustry("38")}</option>
								<option value="39">{getIndustry("39")}</option>
								<option value="40">{getIndustry("40")}</option>
								<option value="41">{getIndustry("41")}</option>
								<option value="42">{getIndustry("42")}</option>
								<option value="43">{getIndustry("43")}</option>
							</FormSelect>
						</div>
						<div className="col-sm-6">
							<FormInput label="Company" required_mark={true} type="text" value={this.state.company} name="company" onChange={this.inputChanged} errors={this.props.errors.company}/>
						</div>
						<div className="col-sm-6">
							<label>Interest area <span className="text-danger">(✳)</span></label>
							<Select
								name="interest_area"
								value={this.state.interest_area ? options.filter(obj => this.state.interest_area.includes(obj.value) === true) : null}
								onChange={this.handleChange}
								options={options}
								isMulti={true}
								closeMenuOnSelect={false}/>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-6">
							<FormInput label="Do you have a Car?" required_mark={true} type="checkbox" checked={this.state.has_car} name="has_car" onChange={this.inputChanged} errors={this.props.errors.has_car}/>
						</div>
					</div>
					{ this.state.has_car ? <div className="row">
						<div className="col-sm-6">
							<FormInput label="Model of your Car" required_mark={true} type="text" value={this.state.car_model} name="car_model" onChange={this.inputChanged} errors={this.props.errors.car_model} {...car_option}/>
						</div>
						<div className="col-sm-6">
							<FormSelect label="Approx. price of car (INR)" required_mark={true} value={this.state.car_cost} name="car_cost" onChange={this.inputChanged} errors={this.props.errors.car_cost}>
								<option value=""></option>
								<option value="1">{getCarCost("1")}</option>
								<option value="2">{getCarCost("2")}</option>
								<option value="3">{getCarCost("3")}</option>
								<option value="4">{getCarCost("4")}</option>
								<option value="5">{getCarCost("5")}</option>
							</FormSelect>
						</div>
					</div> : ""}
					<div className="row">
						<div className="col-sm-6">
							<FormInput label="Do you have a Laptop?" required_mark={true} type="checkbox" checked={this.state.laptop_owned} name="laptop_owned" onChange={this.inputChanged} errors={this.props.errors.laptop_owned}/>
						</div>
						{ this.state.laptop_owned ? <div className="col-sm-6">
							<FormInput label="Model of your Laptop" required_mark={true} type="text" value={this.state.laptop_model} name="laptop_model" onChange={this.inputChanged} errors={this.props.errors.laptop_model} {...laptop_option}/>
						</div> : ""}
					</div>
					<div className="row">
						<div className="col-sm-6">
							<FormInput label="Model of your Mobile" required_mark={true} type="text" value={this.state.mobile_model} name="mobile_model" onChange={this.inputChanged} errors={this.props.errors.mobile_model}/>
						</div>
						<div className="col-sm-6">
							<FormSelect label="Camera Resolution" required_mark={true} value={this.state.camera_resoulution} name="camera_resoulution" onChange={this.inputChanged} errors={this.props.errors.camera_resoulution}>
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
