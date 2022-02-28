import React, { Component } from "react";
import { hashHistory } from "react-router";
import * as ReactRedux from "react-redux";
import PropTypes from "prop-types";
import Alert from "react-s-alert";
import Select from "react-select";

import { setAuditAlignmentFactors } from "../../service/audit_cycle.js";
import { fetchAuditCycles } from "../../actions/audit.js";

import { getAuditorRating, getCarCost, getEducationStatus, getGender, getIncomeText, getInterestArea, getMaritalStatus, getOccupation, getReportRating } from "../../../utils.js";
import { AuditorRatings, CarCostList, EducationList, GenderList, IncomeList, InterestAreaList, MaritalStatusList, OccupationList, ReportRatingList } from "../../../constants.js";

import Modal from "../../../components/Modal.jsx";
import Loading from "../../../components/Loading.jsx";
import { FormDateInput } from "../../../components/FormInput.jsx";

const auditCycleProp = PropTypes.shape({
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	client: PropTypes.shape({
		id: PropTypes.number.isRequired,
		name: PropTypes.string.isRequired,
	}).isRequired,
	questionnaire_type: PropTypes.shape({
		id: PropTypes.number.isRequired,
		name: PropTypes.string.isRequired,
	}),
});

class AuditAlignmentFactors extends Component{
	static propTypes = {
		params: PropTypes.shape({
			auditCycleId: PropTypes.string,
		}).isRequired,

		auditCycle: auditCycleProp,
		fetchAuditCycles: PropTypes.func.isRequired,
	};

	state = {
		submitting: false,
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
		to_available_dates: ""
	};

	componentDidMount() {
		if(this.props.auditCycle){
			this.props.fetchAuditCycles(this.props.auditCycle.client.id);
		}
	}

	componentWillReceiveProps(nextProps){
		let factors_obj = nextProps.auditCycle.audit_alignment_factors;
		if(factors_obj){
			this.setState((prevState) => Object.assign({}, prevState, factors_obj));
		}
	}

	setSubmitting = (submitting) => this.setState((prevState) => Object.assign({}, prevState, { submitting }));

	dateChanged = (date, field_name) => {
		if( typeof date !== "string"){
			this.setState({
				[field_name]: date.format("YYYY-MM-DD")
			});
		}
	};

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
		this.setSubmitting(true);
		setAuditAlignmentFactors(this.state, this.props.auditCycle.id).then(() => {
			this.setSubmitting(false);
			hashHistory.push(`/audit_cycle/${this.props.auditCycle.id}/questionnaire`);
			Alert.success("Audit Alignment Factors Saved");
		}, (err) => {
			this.setSubmitting(false);
			err.responseJSON && this.setState({ errors: err.responseJSON });
		});
	};

	render(){
		let loading = "";
		if(!this.props.auditCycle){
			loading = <Loading />;
		}

		const interestAreaOptions = [];
		const genderOptions = [];
		const educationOptions = [];
		const incomeOptions = [];
		const carCostOptions = [];
		const occupationOptions = [];
		const maritalStatusOptions = [];
		const reportRatingOptions = [];
		const auditorRatingOptions = [];

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

		var modalTitle = "Audit alignment factors";
		return (
			<Modal size="modal-lg" modalTitle={modalTitle} onClose={hashHistory.goBack}>
				{loading ? loading :
					<form onSubmit={this.onSubmit}>
						<div className="row">
							<div className="col-md-6" style={{marginBottom:"10px"}}>
								<label>Gender</label>
								<Select
									name="gender"
									value={this.state.gender ? genderOptions.filter(obj => this.state.gender.includes(obj.value) === true) : null}
									onChange={(e)=>this.selectHandleChange(e, "gender")}
									options={genderOptions}
									isMulti={true}/>
							</div>
							<div className="col-md-6" style={{marginBottom:"10px"}}>
								<label>Education</label>
								<Select
									name="education"
									value={this.state.education ? educationOptions.filter(obj => this.state.education.includes(obj.value) === true) : null}
									onChange={(e)=>this.selectHandleChange(e, "education")}
									options={educationOptions}
									isMulti={true}/>
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
									isMulti={true}/>
							</div>
							<div className="col-md-6" style={{marginBottom:"10px"}}>
								<label>Approx. price of car (INR)</label>
								<Select
									name="car_cost"
									value={this.state.car_cost ? carCostOptions.filter(obj => this.state.car_cost.includes(obj.value) === true) : null}
									onChange={(e)=>this.selectHandleChange(e, "car_cost")}
									options={carCostOptions}
									isMulti={true}/>
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
									isMulti={true}/>
							</div>
							<div className="col-md-6" style={{marginBottom:"10px"}}>
								<label>Interest area</label>
								<Select
									name="interest_area"
									value={this.state.interest_area ? interestAreaOptions.filter(obj => this.state.interest_area.includes(obj.value) === true) : null}
									onChange={(e)=>this.selectHandleChange(e, "interest_area")}
									options={interestAreaOptions}
									isMulti={true}/>
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
									isMulti={true}/>
							</div>
							<div className="col-md-6" style={{marginBottom:"10px"}}>
								<label>Report rating</label>
								<Select
									name="report_rating"
									value={this.state.report_rating ? reportRatingOptions.filter(obj => this.state.report_rating.includes(obj.value) === true) : null}
									onChange={(e)=>this.selectHandleChange(e, "report_rating")}
									options={reportRatingOptions}
									isMulti={true}/>
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
									isMulti={true}/>
							</div>
							<div className="col-md-6" style={{marginBottom:"10px"}}>
								<div style={{display: "flex", justifyContent: "space-between", flexDirection: "row"}}>
									<FormDateInput label="Date Availability" value={this.state.from_available_date} name="from_available_date" onChange={(e) => this.dateChanged(e, "from_available_date")}/>
									<FormDateInput label="&nbsp;" value={this.state.to_available_date} name="to_available_date" onChange={(e) => this.dateChanged(e, "to_available_date")} />
								</div>
							</div>
						</div>
						<div className="row">
							<div className="col-md-12 text-center">
								<button className="btn btn-primary" disabled={this.state.submitting}>
									Submit
								</button>
							</div>
						</div>
					</form>}
			</Modal>
		);
	}
}

const mapStoreToProps = function(store, ownProps) {
	return {
		auditCycle: store.auditCycles[ownProps.params.auditCycleId],
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		fetchAuditCycles: (clientId) => {
			dispatch(fetchAuditCycles(clientId));
		},
	};
};

export default ReactRedux.connect(mapStoreToProps, mapDispatchToProps)(AuditAlignmentFactors);