import React, { Component } from 'react';
import { hashHistory } from 'react-router';

import { findQuestionById, saveQuestion } from '../../manager/service/question.js';

import { getQuestionType } from '../../utils.js';
import { getInputEventChangeValue } from '../../react_utils.js';
import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import FormSelect from '../FormSelect.jsx';
import FormErrorList from '../FormErrorList.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';
import { Plus, Cross } from '../Icons.jsx';

class OptionBuilder extends Component{
	constructor(props){
		super(props);

		let question_data = Object.assign({}, {
			version: 1,
			options: [
				{
					sequence: 1,
					value: "Yes",
					marks: 1,
				},
				{
					sequence: 2,
					value: "No",
					marks: 0,
				},
			],
		}, props.question_data);

		this.state = {
			question_data
		};
	}

	componentDidMount(){
		this.notifyOptionsChanged();
	}

	notifyOptionsChanged = () => {
		if(this.props.onChange){
			this.props.onChange(this.state.question_data);
		}
	}

	setOptions = (newOptions) => {
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				question_data: Object.assign({}, prevState.question_data, {
					options: newOptions
				})
			});
		}, this.notifyOptionsChanged);
	}

	addOption = () => {
		let lastItem = this.state.question_data.options[this.state.question_data.options.length - 1];
		let newOptions = this.state.question_data.options.concat({
			sequence: lastItem && lastItem.sequence + 1 || 0,
			value: "",
			marks: 0,
		});
		this.setOptions(newOptions);
	}

	deleteOption = (index) => {
		let newOptions = this.state.question_data.options.filter((o,i) => i !== index);
		this.setOptions(newOptions);
	}

	setData = (index, key, data) => {
		let newOptions = this.state.question_data.options.map((o, i) => {
			if(i === index){
				o[key] = data;
			}
			return o;
		});
		this.setOptions(newOptions);
	}

	render(){
		let rows = this.state.question_data.options.map((o, i) => {
			return (
				<tr key={i}>
					<td>
						<input className="form-control" type="number" name="sequence" value={o.sequence}
						onChange={(e) => this.setData(i, e.target.name, parseInt(e.target.value))}/>
					</td>
					<td>
						<input className="form-control" type="text" name="value" value={o.value}
						onChange={(e) => this.setData(i, e.target.name, e.target.value)}/>
					</td>
					<td>
						<input className="form-control" type="number" name="marks" value={o.marks}
						onChange={(e) => this.setData(i, e.target.name, parseInt(e.target.value))}/>
					</td>
					<td>
						<button className="btn btn-default pull-right" type="button" 
						onClick={(e) => this.deleteOption(i)}>
							<Cross/>
						</button>
					</td>
				</tr>
			);
		});

		if( rows.length === 0){
			rows.push(<tr><td colSpan={4} className="text-muted text-center">atleast one option is needed</td></tr>);
		}

		return (
			<div className="form-group">
				<table className="table">
					<colgroup>
						<col style={{width:"20%"}}/>
						<col style={{width:"50%"}}/>
						<col style={{width:"20%"}}/>
						<col style={{width:"10%"}}/>
					</colgroup>
					<thead>
						<tr>
							<th>Sequence</th>
							<th>Value</th>
							<th>Marks</th>
							<th>
								<button type="button" className="btn btn-default pull-right" onClick={this.addOption}>
			<Plus/>
			</button>
							</th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			</div>
		);
	};
}

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
	saveAndNext: function(e){
		e.preventDefault();
		saveQuestion(this.state.form).then(
			(savedQuestion) => {
				this.setState({
					form: Object.assign({}, this.state.form, {
						sequence: savedQuestion.sequence + 1,
						max_marks: null,
						question_type: "",
						question_txt: "",
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
	},
	questionDataChanged: function(questionData){
		this.setState({
			form: Object.assign({}, this.state.form, {
				question_data: questionData
			})
		});
	},
	render : function(){
		var modalTitle = this.props.params.questionId ? "Edit Question" : "Add Question";

		let optionBuilder;
		if(this.state.form.question_type === "MUTEX"){
			optionBuilder = <OptionBuilder question_data={this.state.form.question_data} onChange={this.questionDataChanged}/>
		}

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
						</FormSelect>
					</div>
					<div className="col-md-12">
						<FormInput label="Question" maxLength="1024" type="text" value={this.state.form.question_txt} name="question_txt" onChange={this.inputChanged} errors={this.state.errors.question_txt}/>
					</div>
					<div className="col-md-12">
						{optionBuilder}
					</div>
					<div className="col-md-12">
						<SaveButton/>&nbsp;
						{ ! this.props.params.questionId ?
						<button type="button" className="btn btn-primary" onClick={this.saveAndNext}>Save and Next</button>
						: null }
					</div>
				</form>
			</Modal>
		);
	},
});

export default QuestionForm;
