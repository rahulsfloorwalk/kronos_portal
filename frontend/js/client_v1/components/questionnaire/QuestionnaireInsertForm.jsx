import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";

import { Plus } from "../../../components/Icons.jsx";

import { fetchIndustry, fetchProblemStatements, fetchSampleQuestionnaireType, fetchSampleQuestionnaires, insertSampleQuestionnaire } from "../../service/questionnaire.js";
import { affectInputEventToComponent } from "../../../react_utils.js";
import QuestionnairePreview from "./QuestionnairePreview.jsx";
import FormSelect from "../../../components/FormSelect.jsx";
import Loading from "../../../components/Loading.jsx";
import Modal from "../../../components/Modal.jsx";

export default class QuestionnaireInsertForm extends React.Component{
	static propTypes = {
		params: PropTypes.shape({
			auditCycleId: PropTypes.string,
		}).isRequired,
	};

	state = {
		loading: false,
		industry_list: [],
		problem_statement_list: [],
		questionnaire_type_list: [],
		questionnaire_list: [],
		industry: "",
		problem_statement: "",
		questionnaire_type: "",
		questionnaire: "",
		filter_error: "",
		errors: {},
	};

	componentDidMount(){
		fetchIndustry().then((industry_list)=>this.setState({industry_list}));
	}

	industryChanged = (e) => {
		affectInputEventToComponent(e, this);
		fetchProblemStatements(e.target.value).then((problem_statement_list) => this.setState({problem_statement_list}));
	};

	problemStatementChanged = (e) => {
		affectInputEventToComponent(e, this);
		fetchSampleQuestionnaireType(e.target.value).then((questionnaire_type_list) => this.setState({questionnaire_type_list}));
	};

	questionnaireTypeChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onClearFilter = () => {
		this.setState({
			industry: "",
			problem_statement: "",
			questionnaire_type: "",
			questionnaire: "",
			filter_error: "",
			errors: {},
		});
	};

	onSearch = () => {
		if(this.state.questionnaire_type == ""){
			this.setState({
				filter_error: "Please select valid filters",
				errors: {},
			});
		}
		else{
			this.setState({
				loading: true,
				questionnaire: "",
				filter_error: "",
				errors: {},
			});
			fetchSampleQuestionnaires(this.state.questionnaire_type).then((questionnaire) => {
				this.setState({
					questionnaire,
					loading: false,
					errors: {},
				});
			}, (errors) => {
				this.setState({
					loading: false,
					errors: errors.responseJSON || {},
				});
			});
		}
	};

	onInsertQuestionnaire = () => {
		let text = "Are you sure to continue?";
		if (confirm(text) == false) {
			return false;
		}
		insertSampleQuestionnaire(this.props.params.auditCycleId, this.state.questionnaire.id).then(() => {
			Alert.success("Questionnaire inserted");
			hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/questionnaire`);
		}, (errors)=> {
			let error = errors.responseJSON || {};
			Alert.warning(error.non_field_errors[0]);
			hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/questionnaire`);
		});
	};

	render(){
		let industryOptions = [];
		let problemStatementOptions = [];
		let questionnaireTypeOptions = [];

		for(let i of this.state.industry_list){
			industryOptions.push(<option key={i.id} value={i.id}>{i.name}</option>);
		}

		for(let i of this.state.problem_statement_list){
			problemStatementOptions.push(<option key={i.id} value={i.id}>{i.name}</option>);
		}

		for(let i of this.state.questionnaire_type_list){
			questionnaireTypeOptions.push(<option key={i.id} value={i.id}>{i.name}</option>);
		}

		return(
			<Modal size="modal-lg" modalTitle="Insert questionnaire" onClose={hashHistory.goBack}>
				<div className="row">
					<div className="col-md-4">
						<FormSelect name="industry" label="Select industry" value={this.state.industry} onChange={this.industryChanged}>
							<option>----</option>
							{industryOptions}
						</FormSelect>
					</div>
					<div className="col-md-4">
						<FormSelect name="problem_statement" label="Select problem statements" value={this.state.problem_statement} onChange={this.problemStatementChanged}>
							<option>----</option>
							{problemStatementOptions}
						</FormSelect>
					</div>
					<div className="col-md-4">
						<FormSelect name="questionnaire_type" label="Select questionnaire type" value={this.state.questionnaire_type} onChange={this.questionnaireTypeChanged}>
							<option>----</option>
							{questionnaireTypeOptions}
						</FormSelect>
					</div>
					<div className="col-md-12 text-center">
						{this.state.filter_error ? <p className="text-danger"><b>{this.state.filter_error}</b></p> : null}
						{Object.keys(this.state.errors).length > 0 ? <p className="text-danger"><b>{this.state.errors.non_field_errors}</b></p> : null}
						<button className="btn btn-primary" onClick={this.onSearch}>Search</button>
						&nbsp;&nbsp;&nbsp;
						<button className="btn btn-primary" onClick={this.onClearFilter}>Clear</button>
					</div>
				</div>
				{this.state.loading ? <Loading /> : null}
				{this.state.questionnaire && !this.state.loading ?
					<div>
						<span className="pull-right">
							<button className="btn btn-default" onClick={this.onInsertQuestionnaire}>
								<Plus/> Insert questionnaire
							</button>&nbsp;
						</span>
						<QuestionnairePreview sampleQuestionnaire={this.state.questionnaire} auditCycleId={this.props.params.auditCycleId} />
						<div className="col-md-12 text-center">
							<button className="btn btn-default" onClick={this.onInsertQuestionnaire}>
								<Plus/> Insert questionnaire
							</button><br/><br/>
						</div>
					</div> : null}
			</Modal>
		);
	}
}