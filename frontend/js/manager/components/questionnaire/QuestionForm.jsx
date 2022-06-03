import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { findQuestionById, saveQuestion } from "../../service/question.js";

import { getQuestionType } from "../../../utils.js";
import { getInputEventChangeValue } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import FormSelect from "../../../components/FormSelect.jsx";
import FormErrorList from "../../../components/FormErrorList.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import OptionBuilder from "./OptionBuilder.jsx";
import ImpactFactorInput from "./ImpactFactorInput.jsx";

class QuestionForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			questionId: PropTypes.string,
			sectionId: PropTypes.string,
			auditCycleId: PropTypes.string,
		}),
		location: PropTypes.shape({
			pathname: PropTypes.string.isRequired,
		}),
	};

	state = {
		form: {},
		errors: {}
	};

	componentDidMount() {
		if(this.props.params.questionId){
			findQuestionById(this.props.params.questionId).then(question => this.setState({ "form": question }));
		}
		this.setState({
			form: Object.assign({}, this.state.form, {
				section: this.props.params.sectionId,
				hide_question: false
			})
		});
	}

	inputChanged = (e) => {
		this.setState({
			form: Object.assign({}, this.state.form, getInputEventChangeValue(e))
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		saveQuestion(this.state.form).then(
			() => {
				hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/questionnaire`);
			},
			err => {
				if( err.responseJSON){
					this.setState({
						errors: err.responseJSON
					});
				}
			}
		);
	};

	saveAndNext = (e) => {
		e.preventDefault();
		saveQuestion(this.state.form).then(
			(savedQuestion) => {
				this.setState({
					form: Object.assign({}, this.state.form, {
						sequence: savedQuestion.sequence + 1,
						max_marks: "",
						question_type: "",
						question_txt: "",
						hide_question: false
					})
				});
				hashHistory.push(this.props.location.pathname);
			},
			(err) => {
				if( err.responseJSON){
					this.setState({
						errors: err.responseJSON
					});
				}
			}
		);
	};

	optionsChanged = (options) => {
		this.setState({
			form: Object.assign({}, this.state.form, {
				question_data: Object.assign({}, this.state.form.question_data, {
					version: 1,
					options,
				}),
			})
		});
	};

	impactFactorsChanged = (impactFactors) => {
		if(impactFactors.length > 0){
			this.setState({
				form: Object.assign({}, this.state.form, {
					question_data: Object.assign({}, this.state.form.question_data, {
						version: 1,
						impact_factors: impactFactors,
					}),
				}),
			});
		}
	};

	render() {
		var modalTitle = this.props.params.questionId ? "Edit Question" : "Add Question";

		let optionBuilder;
		if(this.state.form.question_type === "MUTEX" || this.state.form.question_type === "MULTISELECT"){
			optionBuilder = <OptionBuilder
				options={typeof(this.state.form.question_data) === "object" && Object.keys(this.state.form.question_data).length > 0 ? this.state.form.question_data.options : []}
				onChange={this.optionsChanged}
			/>;
		}

		let hide_question_div = (
			<div className="col-md-12">
				<FormInput label="Hide Question" type="checkbox" checked={this.state.form.hide_question} name="hide_question" onChange={this.inputChanged} errors={this.state.errors.hide_question}/>
			</div>
		);
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit} className="row">
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<div className="col-md-4">
						<FormInput label="Sequence" min="1" type="number" value={this.state.form.sequence} name="sequence" onChange={this.inputChanged} errors={this.state.errors.sequence}/>
					</div>
					<div className="col-md-4">
						<FormInput label="Max. Marks" min="0" type="number" value={this.state.form.max_marks} name="max_marks" onChange={this.inputChanged} errors={this.state.errors.max_marks}/>
					</div>
					<div className="col-md-4">
						<FormSelect label="Question Type" value={this.state.form.question_type} name="question_type" onChange={this.inputChanged} errors={this.state.errors.question_type}>
							<option value=""></option>
							<option value="PLAIN">{getQuestionType("PLAIN")}</option>
							<option value="MUTEX">{getQuestionType("MUTEX")}</option>
							<option value="MULTISELECT">{getQuestionType("MULTISELECT")}</option>
						</FormSelect>
					</div>
					<div className="col-md-12">
						<FormInput label="Question" maxLength="1024" type="text" value={this.state.form.question_txt} name="question_txt" onChange={this.inputChanged} errors={this.state.errors.question_txt}/>
					</div>
					<div className="col-md-12">
						{optionBuilder}
					</div>
					<div className="col-md-12">
						<div className="form-group">
							<label>Impact Factors</label>
							<ImpactFactorInput
								impactFactors={this.state.form.question_data ? this.state.form.question_data.impact_factors : []}
								onChange={this.impactFactorsChanged}
							/>
						</div>
					</div>
					{hide_question_div}
					<div className="col-md-12">
						<SaveButton/>&nbsp;
						{ ! this.props.params.questionId ?
							<button type="button" className="btn btn-primary" onClick={this.saveAndNext}>Save and Next</button>
							: null }
					</div>
				</form>
			</Modal>
		);
	}
}

export default QuestionForm;
