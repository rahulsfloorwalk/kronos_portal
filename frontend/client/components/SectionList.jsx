import React from 'react';
import { Link } from 'react-router';

import Jumbotron from '../../js/components/Jumbotron.jsx';
import Panel from '../../js/components/Panel.jsx';
import { Paperclip, Tasks, Plus, Cross, Pencil } from '../../js/components/Icons.jsx';

import AttachmentDisplayBox from './AttachmentDisplayBox.jsx';

import { fetchAnswers } from '../service/answer.js';

var QuestionRow = React.createClass({
	render: function(){
		if(this.props.answer){
			var answer = this.props.answer.answer_text;
			var answerMarks = this.props.answer.marks_obtained;
		}
		return (
			<tr>
				<td>{this.props.q.sequence}</td>
				<td>{this.props.q.question_txt}</td>
				<td>{answer}</td>
				<td>{answerMarks}</td>
				<td>{this.props.q.max_marks}</td>
				<td>
				</td>
			</tr>
		);
	},
});

var Section = React.createClass({
	render: function(){
		let questionRows = [];
		if( this.props.section.questions){
			for(let q of this.props.section.questions){
				let answer = this.props.answers.filter((a) => a.question === q.id)[0];
				questionRows.push(<QuestionRow q={q} key={q.id} answer={answer}/>);
			}
		}
		if(questionRows.length === 0){
			questionRows.push(<tr key="empty"><td colSpan="5" className="text-center text-muted">no questions here</td></tr>);
		}
		if(this.props.reportSection){
			var auditor_comment = this.props.reportSection.auditor_comment;
			var pm_comment = this.props.reportSection.pm_comment;
			var section_marks = this.props.reportSection.marks_obtained;
		}
		var styles = {
			col1: { width: "5%" },
			col2: { width: "40%" },
			col3: { width: "40%" },
			col4: { width: "7.5%" },
			col5: { width: "7.5%" },
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
							<th style={styles.col5}>Max. Marks</th>
						</tr>
					</thead>
					<tbody>
						{questionRows}
					</tbody>
				</table>
				<div className="panel-footer">
					<p><b>Total Marks:</b> {section_marks} out of {this.props.section.max_marks}</p>
					<hr/>
					<p><b>Auditor Comment:</b> {auditor_comment}</p>
					<hr/>
					<p><b>PM Comment:</b> {pm_comment}</p>
				</div>
			</Panel>
		);
	},
});

export default React.createClass({
	getInitialState: function(){
		return {
			answers: []
		};
	},
	componentDidMount: function() {
		fetchAnswers(this.props.auditStoreId).then((answers) => {
			this.setState({
				answers
			});
		});
	},
	render: function(){
		var sectionRows = [];
		for(var s of this.props.sections) {
			let reportSection = this.props.reportSections.filter((rs) => rs.section === s.id)[0];
			sectionRows.push(<Section section={s} answers={this.state.answers} reportSection={reportSection} key={s.id}/>);
		}
		if( sectionRows.length === 0){
			sectionRows.push(<Jumbotron key="empty" heading="this questionnaire is empty" para="contact site administrator"/>);
		}
		return (
			<div>
				<h3 className="page-header">
					<Paperclip/> Attachments
				</h3>
				<AttachmentDisplayBox auditStoreId={this.props.auditStoreId}/>
				<h3 className="page-header">
					<Tasks/> Questionnaire
				</h3>
				{sectionRows}
				{this.props.children}
			</div>
		);
	},
});

