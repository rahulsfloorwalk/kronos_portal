import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Jumbotron from '../Jumbotron.jsx';
import Panel from '../Panel.jsx';
import { Save, Plus, Cross, Pencil, Tasks, OptionHorizontal, Checked, Unchecked } from '../Icons.jsx';

import { affectInputEventToComponent, orderKeys } from '../../react_utils.js'
import { fetchSections } from '../../manager/actions/section.js'
import { fetchAnswers, setMarks } from '../../manager/actions/answer.js'
import { setAnswerText } from '../../manager/service/answer.js'
import { submitAuditorComment, submitPMComment, fetchReportSections, setNotApplicable } from '../../manager/actions/report_section.js'

var __QuestionRow = React.createClass({
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
		setAnswerText(
			this.props.auditStoreId,
			this.props.q.id,
			this.state.answer.answer_text,
		).then(()=> this.setState({answerError: false, answerSuccess: true}), ()=> this.setState({answerError: true, answerSuccess: false}));
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
		this.props.dispatch(setMarks({
			auditStoreId: this.props.auditStoreId,
			questionId: this.props.q.id,
			marks: this.state.answer.marks_obtained,
		})).then(()=> this.setState({error: false, marksObtainedSuccess: true}), ()=> this.setState({error: true, marksObtainedSuccess: false}));
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

var mapStoreToQuestionRowProps = function(store, ownProps){
	return {
		answer: (function(answers){
			for(let id in answers){
				if(answers[id].question === ownProps.q.id && answers[id].audit_store === parseInt(ownProps.auditStoreId)){
					return answers[id];
				}
			}
		})(store.answers)
	};
};

var QuestionRow = ReactRedux.connect(mapStoreToQuestionRowProps)(__QuestionRow);


var __Section = React.createClass({
	getInitialState: function(){
		return {
			pmCommentError: false,
			auditorCommentError: false,

			savingPMComment: false,
			savingAuditorComment: false,

			auditor_comment: "",
			pm_comment: "",

			not_applicable: false,
		};
	},
	componentDidMount: function(){
		if(this.props.reportSection){
			this.setState({
				auditor_comment: this.props.reportSection.auditor_comment,
				pm_comment: this.props.reportSection.pm_comment,
				not_applicable: this.props.reportSection.not_applicable,
			});
		}
	},
	componentWillReceiveProps: function(nextProps){
		if(nextProps.reportSection){
			this.setState({
				auditor_comment: nextProps.reportSection.auditor_comment,
				pm_comment: nextProps.reportSection.pm_comment,
				not_applicable: nextProps.reportSection.not_applicable,
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
		this.props.dispatch(submitAuditorComment(this.props.auditStoreId, this.props.section.id, this.state.auditor_comment)).then(()=> this.setState({auditorCommentError: false}), () => this.setState({auditorCommentError: true})).always(() => this.setState({savingAuditorComment: false}));
	},
	savePMComment: function(e){
		e.preventDefault();
		this.setState({
			savingPMComment: true,
		});
		var payload = {
			sectionId: this.props.section.id,
			pm_comment: this.state.pm_comment,
			audit_store: this.props.auditStoreId,
		};
		this.props.dispatch(submitPMComment(payload)).then(()=> this.setState({pmCommentError: false}), () => this.setState({pmCommentError: true})).always(() => this.setState({savingPMComment: false}));
	},
	notApplicableButtonClicked: function(e){
		this.props.dispatch(setNotApplicable(this.props.auditStoreId, this.props.section.id, !this.state.not_applicable));
	},
	render: function(){

		let editable = this.props.auditStore && this.props.auditStore.status === 'SUBMITTED';

		/* QUESTION ROWS */
		let questionRows = [];
		if( this.props.section.questions){
			for(let q of this.props.section.questions){
				questionRows.push(<QuestionRow q={q} key={q.id} marking={editable} auditStoreId={this.props.auditStoreId}/>);
			}
		}
		if(questionRows.length === 0){
			questionRows.push(<tr key="empty"><td colSpan="4" className="text-center text-muted">no questions here</td></tr>);
		}

		let auditorCommentElement = (<span className="text-muted">auditor comment is empty</span>);
		let pmCommentElement = (<span className="text-muted">PM comment is empty</span>);
		let marksObtained = 0;
		let notApplicableCheckboxIcon = <Unchecked/>;
		let notApplicableElement = (<span className="">{notApplicableCheckboxIcon}</span>);

		/* AUDITOR COMMENT, PM COMMENT */
		if(this.props.reportSection){
			marksObtained = this.props.reportSection.marks_obtained;

			pmCommentElement = this.state.pm_comment ? (<span>{this.state.pm_comment}</span>) : pmCommentElement;
			auditorCommentElement = this.state.auditor_comment ? (<span>{this.state.auditor_comment}</span>) : auditorCommentElement;
			notApplicableCheckboxIcon = this.props.reportSection.not_applicable ? <Checked/> : <Unchecked/>;
			notApplicableElement = (<span className="">{notApplicableCheckboxIcon}</span>);
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

			notApplicableElement = (<button className="btn btn-default btn-sm" onClick={this.notApplicableButtonClicked}>{notApplicableCheckboxIcon}</button>);
		}

		var styles = {
			col1: { width: "5%" },
			col2: { width: "40%" },
			col3: { width: "40%" },
			col4: { width: "15%" },
		};
		let panelBody;

		if( this.state.not_applicable){
			panelBody = (<div className="panel-footer text-center text-muted">section not applicable</div>);
		} else {
			panelBody = ( <div>
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
					<div>
					<b>Total Marks:</b> {marksObtained} out of {this.props.section.max_marks},&nbsp;
					</div>
					<hr/>
					<div><b>Auditor Comment:</b> {auditorCommentElement}</div>
					<hr/>
					<div><b>PM Comment:</b> {pmCommentElement}</div>
				</div>
			</div>);
		}


		return (
			<div className="panel panel-default">
				<span className="pull-right"><b>N/A:</b> {notApplicableElement}</span>
				<div className="panel-heading">
					<h4 className="panel-title">
						{this.props.section.sequence} - ${this.props.section.name}
					</h4>
				</div>
				{panelBody}
			</div>
		);
	},
});

var mapStoreToSectionProps = function(store, ownProps){
	return {
		reportSection: (function(reportSections){
			for(let id in reportSections){
				if(reportSections[id].section === ownProps.section.id){
					return reportSections[id];
				}
			}
		})(store.reportSections),
		auditStore: store.auditStores[ownProps.auditStoreId]
	};
};

var Section = ReactRedux.connect(mapStoreToSectionProps)(__Section);

var AuditStoreReport = React.createClass({
	getInitialState: function(){
		return {
			loading: false
		};
	},
	componentDidMount: function() {
		this.props.dispatch(fetchAnswers(this.props.params.auditStoreId));
		this.props.dispatch(fetchReportSections(this.props.params.auditStoreId));
		if( this.props.auditStore && ! this.state.loading){
			this.setState({
				loading: true
			});
			this.props.dispatch(fetchSections(this.props.auditStore.audit.audit_cycle.id)).always(() => this.setState({loading: false}));
		}
	},
	componentWillReceiveProps: function( nextProps){
		if( nextProps.auditStore && ! this.state.loading ){
			this.setState({
				loading: true
			});
			this.props.dispatch(fetchSections(nextProps.auditStore.audit.audit_cycle.id)).always(() => this.setState({loading: false}));
		}
	},
	render: function(){
		var orderedKeys = orderKeys(this.props.sections, function(s1,s2){
			return s1.sequence - s2.sequence;
		});
		var sectionRows = [];
		for(var sectionId of orderedKeys) {
			sectionRows.push(<Section auditStoreId={this.props.params.auditStoreId} section={this.props.sections[sectionId]} key={sectionId}/>);
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

var mapStoreToProps = function(store, ownProps){
	return {
		auditStore: store.auditStores[ownProps.params.auditStoreId],
		sections: store.sections
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditStoreReport);
