import React, { Component } from "react";
import PropTypes from "prop-types";

import Select from "react-select";

import { getAuditorRating, getCarCost, getEducationStatus, getGender, getIncomeText, getInterestArea, getMaritalStatus, getOccupation, getReportRating } from "../../../utils.js";
import { AuditorRatings, CarCostList, EducationList, GenderList, IncomeList, InterestAreaList, MaritalStatusList, OccupationList, ReportRatingList } from "../../../constants.js";

export default class AuditorProfileForm extends Component{

	static propTypes = {
		isFormDisabled: PropTypes.bool,
		onSubmit: PropTypes.func,
		prevStep: PropTypes.func
	};

	state = {
		gender: [],
		education: [],
		income: [],
		car_cost: [],
		occupation: [],
		interest_area: [],
		marital_status: [],
		report_rating: [],
		auditor_rating: [],
		auditor_age: 0,
		from_available_date: "",
		to_available_date: "",
		date_availability: "",
		errors: {}
	};

	// dateChanged = (date, field_name) => {
	// 	if( typeof date !== "string"){
	// 		this.setState({
	// 			[field_name]: date.format("YYYY-MM-DD")
	// 		}, () => {
	// 			let date_availability = "";
	// 			if(this.state.from_available_date != "" && this.state.to_available_date != ""){
	// 				date_availability = this.state.from_available_date + " - " + this.state.to_available_date;
	// 			}
	// 			this.setState({
	// 				date_availability: date_availability,
	// 			});
	// 		});
	// 	}
	// };

	selectHandleChange = (selected_value, field_name) => {
		let selected_list = selected_value.map(val=>val.value);
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				[field_name]: selected_list,
				[field_name + "_list"]:selected_value
			});
		});
	};

	onSubmit = (e) => {
		e.preventDefault();

		const payload = {
			profile: {
				gender: this.state.gender,
				education: this.state.education,
				income: this.state.income,
				car_cost: this.state.car_cost,
				occupation: this.state.occupation,
				interest_area: this.state.interest_area,
				marital_status: this.state.marital_status,
				report_rating: this.state.report_rating,
				auditor_rating: this.state.auditor_rating,
				date_availability: this.state.date_availability,
			},
		};

		this.props.onSubmit(payload);
	};

	render(){

		const interestAreaOptions = [];
		const genderOptions = [];
		const educationOptions = [];
		const incomeOptions = [];
		const carCostOptions = [];
		const occupationOptions = [];
		const maritalStatusOptions = [];
		const reportRatingOptions = [];
		const auditorRatingOptions = [];
		let isFormDisabled = this.props.isFormDisabled;

		for(let option of InterestAreaList){
			interestAreaOptions.push({
				label: getInterestArea(option),
				value: option
			});
		}

		for(let option of GenderList){
			genderOptions.push({
				label: getGender(option),
				value: option
			});
		}

		for(let option of EducationList){
			educationOptions.push({
				label: getEducationStatus(option),
				value: option
			});
		}

		for(let option of IncomeList){
			incomeOptions.push({
				label: getIncomeText(option),
				value: option
			});
		}

		for(let option of CarCostList){
			carCostOptions.push({
				label: getCarCost(option),
				value: option
			});
		}

		for(let option of OccupationList){
			occupationOptions.push({
				label: getOccupation(option),
				value: option
			});
		}

		for(let option of MaritalStatusList){
			maritalStatusOptions.push({
				label: getMaritalStatus(option),
				value: option
			});
		}

		for(let option of AuditorRatings){
			auditorRatingOptions.push({
				label: getAuditorRating(option),
				value: option
			});
		}

		for(let option of ReportRatingList){
			reportRatingOptions.push({
				label: getReportRating(option),
				value: option
			});
		}

		return (
			<div className="panel panel-default">
				<div className="panel-heading"><b>Select auditor profile</b></div>
				<div className="panel-body">
					<form onSubmit={this.onSubmit}>
						<p className="text-danger" style={{fontWeight:"bold"}}>{this.state.errors.non_field_errors != "undefined" ? this.state.errors.non_field_errors : null}</p>
						<div className="row">
							<div className="col-md-6" style={{marginBottom:"10px"}}>
								<label>Gender</label>
								<Select
									name="gender"
									value={this.state.gender ? genderOptions.filter(obj => this.state.gender.includes(obj.value) === true) : null}
									onChange={(e)=>this.selectHandleChange(e, "gender")}
									options={genderOptions}
									isMulti={true}
									closeMenuOnSelect={false}
									isDisabled={isFormDisabled}/>
							</div>
							<div className="col-md-6" style={{marginBottom:"10px"}}>
								<label>Education</label>
								<Select
									name="education"
									value={this.state.education ? educationOptions.filter(obj => this.state.education.includes(obj.value) === true) : null}
									onChange={(e)=>this.selectHandleChange(e, "education")}
									options={educationOptions}
									isMulti={true}
									closeMenuOnSelect={false}
									isDisabled={isFormDisabled}/>
							</div>
						</div>
						<div className="row">
							<div className="col-md-6" style={{marginBottom:"10px"}}>
								<label>Income</label>
								<Select
									name="income"
									value={this.state.income ? incomeOptions.filter(obj => this.state.income.includes(obj.value) === true) : null}
									onChange={(e)=>this.selectHandleChange(e, "income")}
									options={incomeOptions}
									isMulti={true}
									closeMenuOnSelect={false}
									isDisabled={isFormDisabled}/>
							</div>
							<div className="col-md-6" style={{marginBottom:"10px"}}>
								<label>Approx. price of car (INR)</label>
								<Select
									name="car_cost"
									value={this.state.car_cost ? carCostOptions.filter(obj => this.state.car_cost.includes(obj.value) === true) : null}
									onChange={(e)=>this.selectHandleChange(e, "car_cost")}
									options={carCostOptions}
									isMulti={true}
									closeMenuOnSelect={false}
									isDisabled={isFormDisabled}/>
							</div>
						</div>
						<div className="row">
							<div className="col-md-6" style={{marginBottom:"10px"}}>
								<label>Occupation</label>
								<Select
									name="occupation"
									value={this.state.occupation ? occupationOptions.filter(obj => this.state.occupation.includes(obj.value) === true) : null}
									onChange={(e)=>this.selectHandleChange(e, "occupation")}
									options={occupationOptions}
									isMulti={true}
									closeMenuOnSelect={false}
									isDisabled={isFormDisabled}/>
							</div>
							<div className="col-md-6" style={{marginBottom:"10px"}}>
								<label>Interest area</label>
								<Select
									name="interest_area"
									value={this.state.interest_area ? interestAreaOptions.filter(obj => this.state.interest_area.includes(obj.value) === true) : null}
									onChange={(e)=>this.selectHandleChange(e, "interest_area")}
									options={interestAreaOptions}
									isMulti={true}
									closeMenuOnSelect={false}
									isDisabled={isFormDisabled}/>
							</div>
						</div>
						<div className="row">
							<div className="col-md-6" style={{marginBottom:"10px"}}>
								<label>Marital status</label>
								<Select
									name="marital_status"
									value={this.state.marital_status ? maritalStatusOptions.filter(obj => this.state.marital_status.includes(obj.value) === true) : null}
									onChange={(e)=>this.selectHandleChange(e, "marital_status")}
									options={maritalStatusOptions}
									isMulti={true}
									closeMenuOnSelect={false}
									isDisabled={isFormDisabled}/>
							</div>
							<div className="col-md-6" style={{marginBottom:"10px"}}>
								<label>Report rating</label>
								<Select
									name="report_rating"
									value={this.state.report_rating ? reportRatingOptions.filter(obj => this.state.report_rating.includes(obj.value) === true) : null}
									onChange={(e)=>this.selectHandleChange(e, "report_rating")}
									options={reportRatingOptions}
									isMulti={true}
									closeMenuOnSelect={false}
									isDisabled={isFormDisabled}/>
							</div>
						</div>
						<div className="row">
							<div className="col-md-6" style={{marginBottom:"10px"}}>
								<label>Auditor rating</label>
								<Select
									name="auditor_rating"
									value={this.state.auditor_rating ? auditorRatingOptions.filter(obj => this.state.auditor_rating.includes(obj.value) === true) : null}
									onChange={(e)=>this.selectHandleChange(e, "auditor_rating")}
									options={auditorRatingOptions}
									isMulti={true}
									closeMenuOnSelect={false}
									isDisabled={isFormDisabled}/>
							</div>
							{/* <div className="col-md-6" style={{marginBottom:"10px"}}>
								<div style={{display: "flex", justifyContent: "space-between", flexDirection: "row"}}>
									<FormDateInput label="Date Availability" value={this.state.from_available_date} name="from_available_date" onChange={(e) => this.dateChanged(e, "from_available_date")} disabled={isFormDisabled}/>
									<FormDateInput label="&nbsp;" value={this.state.to_available_date} name="to_available_date" onChange={(e) => this.dateChanged(e, "to_available_date")} disabled={isFormDisabled} />
								</div>
							</div> */}
						</div>
						<div className="row">
							<div className="col-md-12 text-center">
								<br/>
								<button className="btn btn-primary" onClick={this.props.prevStep} disabled={isFormDisabled}>
									Previous
								</button>
								&nbsp;&nbsp;&nbsp;
								<button type="submit" className="btn btn-primary" disabled={isFormDisabled}>
									Next
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		);
	}
}