import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Jumbotron from '../../components/Jumbotron.jsx';
import Panel from '../../components/Panel.jsx';
import { Save, Plus, Cross, Pencil, Tasks, OptionHorizontal } from '../../components/Icons.jsx';

import { affectInputEventToComponent, orderKeys } from '../../react_utils.js'
import { fetchAnswers, setAnswerText, setMarks } from '../service/answer.js'
import { fetchSections, fetchReportSections, submitAuditorComment, submitPMComment } from '../service/section.js'

let QuestionRow = React.createClass({
	getDefaultProps: function(){
		return {
			marking: false
		};
	},
	getInitialState: function(){
		return {
			answer: {},
			error: false,
			marksObtainedSuccess: false,
			answerError: false,
			answerSuccess: false
		};
	},
	componentDidMount: function(){
		if(this.props.answer){
			this.setState({
				answer: this.props.answer
			});
		}
	},
	componentWillReceiveProps: function(nextProps){
		if(nextProps.answer){
			this.setState({
				answer: nextProps.answer
			});
		}
	},
	answerChanged: function(e){
		this.setState({
			answer: Object.assign({}, this.state.answer, {
				answer_text: e.target.value
			})
		});
	},
	saveAnswer: function(e){
		this.answerChanged(e);
		setAnswerText( this.props.auditStoreId, this.props.q.id, this.state.answer.answer_text).then(()=> this.setState({answerError: false, answerSuccess: true}), ()=> this.setState({answerError: true, answerSuccess: false}));
	},
	marksChanged: function(e){
		this.setState({
			answer: Object.assign({}, this.state.answer, {
				marks_obtained: e.target.value
			})
		});
	},
	saveMarks: function(e){
		this.marksChanged(e);
		setMarks( this.props.auditStoreId, this.props.q.id, this.state.answer.marks_obtained).then(()=> this.setState({error: false, marksObtainedSuccess: true}), ()=> this.setState({error: true, marksObtainedSuccess: false}));
	},
	render: function(){
		let markElement = (<span><b>{this.state.answer.marks_obtained}</b>&nbsp;/&nbsp;<b>{this.props.q.max_marks}</b></span>);
		let answerElement = (<big>{this.state.answer.answer_text}</big>);
		if( this.props.marking){
			let hasError = this.state.error ? "has-error" : "";
			let hasMarksObtainedSuccess = this.state.marksObtainedSuccess ? "has-success" : "";
			markElement = (
				<div className={`input-group ${hasError} ${hasMarksObtainedSuccess}`}>
					<input className="form-control input-sm text-right" 
						onChange={this.marksChanged}
						onBlur={this.saveMarks}
						value={this.state.answer.marks_obtained}/>
					<span className="input-group-addon">/&nbsp;{this.props.q.max_marks}</span>
				</div>
			);

			let hasAnswerError = this.state.answerError ? "has-error" : "";
			let hasAnswerSuccess = this.state.answerSuccess ? "has-success" : "";
			answerElement = (
				<div className={hasAnswerError + hasAnswerSuccess}>
					<input className="form-control"
						onChange={this.answerChanged}
						onBlur={this.saveAnswer}
						value={this.state.answer.answer_text}/>
				</div>
			);
		} 
		return (
			<tr>
				<td>{this.props.q.sequence}</td>
				<td>{this.props.q.question_txt}</td>
				<td>{answerElement}</td>
				<td className="text-right">{markElement}</td>
			</tr>
		);
	},
});

let Section = React.createClass({
	getInitialState: function(){
		return {
			pmCommentError: false,
			auditorCommentError: false,

			savingPMComment: false,
			savingAuditorComment: false,

			auditor_comment: "",
			pm_comment: "",
		};
	},
	componentDidMount: function(){
		if(this.props.reportSection){
			this.setState({
				auditor_comment: this.props.reportSection.auditor_comment,
				pm_comment: this.props.reportSection.pm_comment
			});
		}
	},
	componentWillReceiveProps: function(nextProps){
		if(nextProps.reportSection){
			this.setState({
				auditor_comment: nextProps.reportSection.auditor_comment,
				pm_comment: nextProps.reportSection.pm_comment
			});
		}
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	saveAuditorComment: function(e){
		e.preventDefault();
		this.setState({
			savingAuditorComment: true,
			auditorCommentError: false
		});
		submitAuditorComment(this.props.auditStoreId, this.props.section.id, this.state.auditor_comment).then(()=> this.setState({auditorCommentError: false}), () => this.setState({auditorCommentError: true})).always(() => this.setState({savingAuditorComment: false}));
	},
	savePMComment: function(e){
		e.preventDefault();
		this.setState({
			savingPMComment: true,
		});
		submitPMComment(this.props.auditStoreId, this.props.section.id, this.state.pm_comment).then(()=> this.setState({pmCommentError: false}), () => this.setState({pmCommentError: true})).always(() => this.setState({savingPMComment: false}));
	},
	render: function(){

		let editable = this.props.auditStore && this.props.auditStore.status === 'SUBMITTED';

		/* QUESTION ROWS */
		let questionRows = [];
		if( this.props.section.questions){
			for(let q of this.props.section.questions){
				let answer = this.props.answers.filter(a => a.question === q.id)[0];
				questionRows.push(<QuestionRow q={q} key={q.id} answer={answer} marking={editable} auditStore={this.props.auditStore} auditStoreId={this.props.auditStoreId}/>);
			}
		}
		if(questionRows.length === 0){
			questionRows.push(<tr key="empty"><td colSpan="4" className="text-center text-muted">no questions here</td></tr>);
		}

		let auditorCommentElement = (<span className="text-muted">auditor comment is empty</span>);
		let pmCommentElement = (<span className="text-muted">PM comment is empty</span>);
		let marksObtained = 0;

		/* AUDITOR COMMENT, PM COMMENT */
		if(this.props.reportSection){
			marksObtained = this.props.reportSection.marks_obtained;

			pmCommentElement = this.state.pm_comment ? (<span>{this.state.pm_comment}</span>) : pmCommentElement;
			auditorCommentElement = this.state.auditor_comment ? (<span>{this.state.auditor_comment}</span>) : auditorCommentElement;
		}

		if(editable){
			let savePmCommentIcon = <Save/>;
			if(this.state.savingPMComment){
				savePmCommentIcon = <OptionHorizontal/>;
			}
			let pmClass = "";
			if(this.state.pmCommentError){
				pmClass = "has-error";
			}
			pmCommentElement = (
					<form className={"input-group " + pmClass} onSubmit={this.savePMComment}>
						<input
							disabled={this.state.savingPMComment}
							placeholder="enter PM comment here"
							required="true"
							className="form-control"
							name="pm_comment"
							value={this.state.pm_comment}
							onBlur={this.savePMComment}
							onChange={this.inputChanged}
						/>
						<span className="input-group-btn">
							<button className="btn btn-primary"
								disabled={this.state.savingPMComment}>
								{savePmCommentIcon} Save
							</button>
						</span>
					</form>
			);

			let saveAuditorCommentIcon = <Save/>;
			if(this.state.savingAuditorComment){
				saveAuditorCommentIcon = <OptionHorizontal/>;
			}
			let auditorClass = "";
			if(this.state.auditorCommentError){
				auditorClass = "has-error";
			}
			auditorCommentElement = (
					<form className={"input-group " + auditorClass} onSubmit={this.saveAuditorComment}>
						<input
							disabled={this.state.savingAuditorComment}
							placeholder="enter auditor comment here"
							required="true"
							className="form-control"
							name="auditor_comment"
							value={this.state.auditor_comment}
							onBlur={this.saveAuditorComment}
							onChange={this.inputChanged}
						/>
						<span className="input-group-btn">
							<button className="btn btn-primary"
								disabled={this.state.savingAuditorComment}>
								{saveAuditorCommentIcon} Save
							</button>
						</span>
					</form>
			);
		}

		var styles = {
			col1: { width: "5%" },
			col2: { width: "40%" },
			col3: { width: "40%" },
			col4: { width: "15%" },
		};
		return (
			<Panel title={`${this.props.section.sequence} - ${this.props.section.name}`} noBody={true}>
				<table className="table table-striped">
					<thead>
						<tr>
							<th style={styles.col1}>#</th>
							<th style={styles.col2}>Question</th>
							<th style={styles.col3}>Answer</th>
							<th style={styles.col4}>Marks</th>
						</tr>
					</thead>
					<tbody>
						{questionRows}
					</tbody>
				</table>
				<div className="panel-footer">
					<p><b>Total Marks:</b> {marksObtained} out of {this.props.section.max_marks}</p>
					<hr/>
					<div><b>Auditor Comment:</b> {auditorCommentElement}</div>
					<hr/>
					<div><b>PM Comment:</b> {pmCommentElement}</div>
				</div>
			</Panel>
		);
	},
});

export default React.createClass({
	getInitialState: function(){
		return {
			sections: [],
			reportSections: [],
			answers: [],
			loading: false
		};
	},
	componentDidMount: function() {
		fetchSections(this.props.auditStoreId).then((sections) => {
			this.setState({
				sections
			});
		});
		fetchAnswers(this.props.auditStoreId).then((answers) => {
			this.setState({
				answers
			});
		});
		fetchReportSections(this.props.auditStoreId).then((reportSections) => {
			this.setState({
				reportSections
			});
		});
	},
	render: function(){
		//var orderedKeys = orderKeys(this.props.sections, function(s1,s2){
		//	return s1.sequence - s2.sequence;
		//});
		var sectionRows = [];
		for(var section of this.state.sections) {
			let reportSection = this.state.reportSections.filter(rs => rs.section === section.id)[0];
			sectionRows.push(<Section key={section.id}
				auditStoreId={this.props.auditStoreId} 
				auditStore={this.props.auditStore} 
				section={section}
				reportSection={reportSection}
				answers={this.state.answers}
				/>);
		}
		if( sectionRows.length === 0){
			sectionRows.push(<Jumbotron key="empty" heading="this questionnaire is empty" para="please add a section from the questionnaire"/>);
		}
		return (
			<div>
				<h3 className="page-header"><Tasks/> Questionnaire</h3>
				{sectionRows}
				{this.props.children}
			</div>
		);
	},
});

