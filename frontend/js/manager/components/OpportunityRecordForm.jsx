import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";
import Select from "react-select";

import { fetchStates, fetchCities } from "../service/location.js";
import { findAuditorCountOpportunityEmail, saveOpportunityEmailRecord } from "../service/opportunity_email.js";

import { getInputEventChangeValue } from "../../react_utils.js";
import SaveButton from "../../components/SaveButton.jsx";
import FormErrorList from "../../components/FormErrorList.jsx";
import Modal from "../../components/Modal.jsx";
import Loading from "../../components/Loading.jsx";

import { __StateSelector } from "../../components/StateSelector.jsx";
import { __CitySelector } from "../../components/CitySelector.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import { getAuditorRating, getEducationStatus, getIncomeText, getIndustry, getInterestArea, getOccupation } from "../../utils.js";
import { AuditorRatings, EducationList, IndustryList, InterestAreaList, OccupationList } from "../../constants.js";

export default class OpportunityEmailRecordForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}),
	};

	state = {
		errors: {},
		form: {
			channel_name: "",
		},
		cities: [],
		states: {},
		loading: false,
		filter_count: "",
		filter_error: "",
	};

	componentDidMount() {
		fetchStates().done((states)=>this.setState({states}));
	}

	inputChanged = (e) => {
		let change = getInputEventChangeValue(e);
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				form: Object.assign({}, prevState.form, change),
			});
		});
	};

	selectHandleChange = (selected_value, field_name) => {
		let selected_list = selected_value.map(val=>val.value);
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				form: Object.assign({}, prevState.form, {
					[field_name]: selected_list,
					[field_name + "_list"]:selected_value
				}),
			});
		});
	};

	stateChanged = (e) => {
		this.inputChanged(e);
		fetchCities(e.target.value).done((cities)=>this.setState({cities}));
	};

	getFilterData = () =>{
		return {
			city: this.state.form.city,
			gender: this.state.form.gender,
			education: this.state.form.education,
			occupation: this.state.form.occupation,
			industry: this.state.form.industry,
			income: this.state.form.income,
			interest_area: this.state.form.interest_area,
			auditor_rating: this.state.form.auditor_rating,
			channel_name: this.state.form.channel_name,
		};
	};
	onSendInvitation=()=>{
		let filters = this.getFilterData();
		if(this.state.form.channel_name == ""){
			alert("Please select at least one channel");
			return false;
		}
		if(this.state.form.city == undefined || this.state.form.city == ""){
			this.setState({filter_error:"Please select a city", filter_count: ""});
		}
		else{
			this.setState({filter_error:"", loading:true});
			saveOpportunityEmailRecord(this.props.params.auditCycleId,filters).done(() => {
				hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/opportunity_notification`);
				Alert.success("NOTIFICATION SCHEDULED");
			}).fail((err) => {
				this.setState({
					errors: err.responseJSON || {},
					loading:false
				});
			});
		}
	};
	onCheckCount = () =>{
		if(this.state.form.channel_name == ""){
			alert("Please select at least one channel");
			return false;
		}
		if(this.state.form.city == undefined || this.state.form.city == ""){
			this.setState({filter_error:"Please select a city", filter_count: ""});
		}
		else{
			this.setState({filter_error:"", loading:true});
			let filters = this.getFilterData();
			findAuditorCountOpportunityEmail(filters).then((res)=>{
				if(res.count == 0){
					this.setState({filter_error:"Auditors not found for this filter"});
				}
				this.setState({filter_count: res.count});
			}).always(() => this.setState({loading:false}));
		}
	};

	onSubmit = (e) => {
		e.preventDefault();
		// if(this.state.form.channel_name){
		// 	if(this.state.form.channel_name == "sms" || this.state.form.channel_name == "whatsapp"){
		// 		if(this.state.filter_count > 20){
		// 			alert("Auditor limit is reached for SMS or Whatsapp");
		// 			return false;
		// 		}
		// 	}
		// }
		if(this.state.form.channel_name == ""){
			alert("Please select at least one channel");
			return false;
		}
		let filters = this.getFilterData();
		saveOpportunityEmailRecord(this.props.params.auditCycleId, filters).done(() => {
			hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/opportunity_notification`);
			Alert.success("NOTIFICATION SCHEDULED");
		}).fail((err) => {
			this.setState({
				errors: err.responseJSON || {},
			});
		});
	};

	render() {
		if( ! (this.state.states)){
			return <Loading/>;
		}

		const interest_area_options = [];
		const industry_options = [];
		const occupation_options = [];
		const education_options = [];
		const auditor_rating_options = [];

		for(let option of InterestAreaList){
			interest_area_options.push({
				label: getInterestArea(option),
				value: option
			});
		}

		for(let option of OccupationList){
			occupation_options.push({
				label: getOccupation(option),
				value: option
			});
		}

		for(let option of EducationList){
			education_options.push({
				label: getEducationStatus(option),
				value: option
			});
		}

		for (let i = 0; i < IndustryList.length; i++) {
			industry_options.push({
				label: getIndustry(i),
				value: i
			});
		}

		for (let option of AuditorRatings) {
			auditor_rating_options.push({
				label: getAuditorRating(option),
				value: option
			});
		}

		return (
			<Modal size="modal-lg" modalTitle="Schedule Opportunity Notifications" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					{this.state.filter_error ? <p className="text-danger"><b>{this.state.filter_error}</b></p> : null}
					<div className="row" style={{marginBottom:"2rem"}}>
						<div className="col-sm-3">
							<__StateSelector states={this.state.states} value={this.state.form.state} onChange={this.stateChanged}/>
						</div>
						<div className="col-sm-3">
							<__CitySelector cities={this.state.cities} value={this.state.form.city} onChange={this.inputChanged}/>
						</div>
						<div className="col-sm-3">
							<FormSelect label="Gender" name="gender" value={this.state.form.gender} onChange={this.inputChanged}>
								<option value=""></option>
								<option value="M">Male</option>
								<option value="F">Female</option>
								<option value="N">Trans person</option>
								<option value="N">Non-binary</option>
							</FormSelect>
						</div>
						<div className="col-sm-3">
							<label>Education</label>
							<Select
								name="education"
								value={this.state.form.education ? education_options.filter(obj => this.state.form.education.includes(obj.value) === true) : null}
								onChange={(e)=>this.selectHandleChange(e, "education")}
								options={education_options}
								isMulti={true}/>
							<br/>
						</div>
						<div className="col-sm-3">
							<label>Occupation</label>
							<Select
								name="occupation"
								value={this.state.form.occupation ? occupation_options.filter(obj => this.state.form.occupation.includes(obj.value) === true) : null}
								onChange={(e)=>this.selectHandleChange(e, "occupation")}
								options={occupation_options}
								isMulti={true}/>
						</div>
						<div className="col-sm-3">
							<label>Industry</label>
							<Select
								name="industry"
								value={this.state.form.industry ? industry_options.filter(obj => this.state.form.industry.includes(obj.value) === true) : null}
								onChange={(e)=>this.selectHandleChange(e, "industry")}
								options={industry_options}
								isMulti={true}/>
						</div>
						<div className="col-sm-3">
							<FormSelect label="Income" value={this.state.form.income} name="income" onChange={this.inputChanged}>
								<option value=""></option>
								<option value="0">{getIncomeText("0")}</option>
								<option value="1">{getIncomeText("1")}</option>
								<option value="2">{getIncomeText("2")}</option>
								<option value="3">{getIncomeText("3")}</option>
								<option value="4">{getIncomeText("4")}</option>
								<option value="5">{getIncomeText("5")}</option>
							</FormSelect>
						</div>
						<div className="col-sm-3">
							<label>Interest area</label>
							<Select
								name="interest_area"
								value={this.state.form.interest_area ? interest_area_options.filter(obj => this.state.form.interest_area.includes(obj.value) === true) : null}
								onChange={(e)=>this.selectHandleChange(e, "interest_area")}
								options={interest_area_options}
								isMulti={true}/>
							<br/>
						</div>
						<div className="col-sm-3">
							<label>Auditor rating</label>
							<Select
								name="auditor_rating"
								value={this.state.form.auditor_rating ? auditor_rating_options.filter(obj => this.state.form.auditor_rating.includes(obj.value) === true) : null}
								onChange={(e)=>this.selectHandleChange(e, "auditor_rating")}
								options={auditor_rating_options}
								isMulti={true}/>
						</div>
					</div>
					<div>
						<p><b>Select Channel</b></p>
						<label>
							<input type="radio" name="channel_name" value="email" defaultChecked={false} onChange={this.inputChanged}/>
							&nbsp;&nbsp;Email
						</label>
						&nbsp;&nbsp;&nbsp;&nbsp;
						<label>
							<input type="radio" name="channel_name" value="sms" defaultChecked={false} onChange={this.inputChanged}/>
							&nbsp;&nbsp;SMS
						</label>
						&nbsp;&nbsp;&nbsp;&nbsp;
						<label>
							<input type="radio" name="channel_name" value="whatsapp" defaultChecked={false} onChange={this.inputChanged}/>
							&nbsp;&nbsp;Whatsapp
						</label>
						<br/><br/>
						<p><b>Note: </b></p>
						<ul>
							<li>SMS or Whatsapp notification limit is 20 people at a time.</li>
							<li>Email notification limit is 50 people at a time.</li>
						</ul>
						<br/>
					</div>
					<div className="row text-center">
						{this.state.loading ? <Loading/> : this.state.form.city==11132323 ?  <button className="btn btn-success" onClick={this.onSendInvitation}>Send Invitation</button> : this.state.loading ? <Loading/> : <button type="button" className="btn btn-primary" onClick={this.onCheckCount}>Check auditors</button>}
					</div>

					{!this.state.loading && this.state.filter_count != "" ? <p><b>{this.state.filter_count} auditor{this.state.filter_count > 1 ? "s" : null} found for this filter</b></p> : null}
					{!this.state.loading && this.state.filter_count > 0 ? <SaveButton text="Send notification"/> : null}
				</form>
			</Modal>
		);
	}
}
