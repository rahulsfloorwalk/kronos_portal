import React from 'react';
import { hashHistory } from 'react-router';

import { findQuestionById, saveQuestion } from '../../manager/service/question.js';

import { getInputEventChangeValue } from '../../react_utils.js';
import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';

var QuestionForm = React.createClass({
	getInitialState: function(){
		return {
			form: {},
			errors: {}
		};
	},
	componentDidMount: function() {
		if(this.props.params.questionId){
			findQuestionById(this.props.params.questionId).then(question => this.setState({ 'form': question }));
		} 
		this.setState({
			form: Object.assign({}, this.state.form, {
				section: this.props.params.sectionId
			})
		});
	},
	inputChanged: function(e){
		this.setState({
			form: Object.assign({}, this.state.form, getInputEventChangeValue(e))
		});
	},
	onSubmit: function(e){
		e.preventDefault();
		saveQuestion(this.state.form).then(
			savedQuestion => {
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
	},
	render : function(){
		var modalTitle = this.props.params.questionId ? "Edit Question" : "Add Question";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormInput label="Sequence" min="1" type="number" value={this.state.form.sequence} name="sequence" onChange={this.inputChanged} errors={this.state.errors.sequence}/>
					<FormInput label="Question" maxLength="1024" type="text" value={this.state.form.question_txt} name="question_txt" onChange={this.inputChanged} errors={this.state.errors.question_txt}/>
					<FormInput label="Max. Marks" min="1" type="number" value={this.state.form.max_marks} name="max_marks" onChange={this.inputChanged} errors={this.state.errors.max_marks}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	},
});

export default QuestionForm;
