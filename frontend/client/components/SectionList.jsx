import React from 'react';
import { Link } from 'react-router';

import Jumbotron from '../../js/components/Jumbotron.jsx';
import Panel from '../../js/components/Panel.jsx';
import { Tasks, Plus, Cross, Pencil } from '../../js/components/Icons.jsx';

import { orderKeys } from '../../js/react_utils.js';

import { fetchSections } from '../service/section.js';
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
			questionRows.push(<tr key="empty"><td colSpan="4" className="text-center text-muted">no questions here</td></tr>);
		}
		var styles = {
			col1: { width: "5%" },
			col2: { width: "40%" },
			col3: { width: "40%" },
			col4: { width: "5%" },
			col5: { width: "5%" },
			col6: { width: "5%" },
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
							<th style={styles.col6}></th>
						</tr>
					</thead>
					<tbody>
						{questionRows}
					</tbody>
				</table>
			</Panel>
		);
	},
});

export default React.createClass({
	getInitialState: function(){
		return {
			sections: [],
			answers: []
		};
	},
	componentDidMount: function() {
		fetchSections(this.props.params.auditStoreId).then((sections) => {
			this.setState({
				sections
			});
		});
		fetchAnswers(this.props.params.auditStoreId).then((answers) => {
			this.setState({
				answers
			});
		});
	},
	render: function(){
		var sectionRows = [];
		for(var sectionId in this.state.sections) {
			sectionRows.push(<Section section={this.state.sections[sectionId]} answers={this.state.answers} key={sectionId}/>);
		}
		if( sectionRows.length === 0){
			sectionRows.push(<Jumbotron key="empty" heading="this questionnaire is empty" para="contact site administrator"/>);
		}
		return (
			<div>
				<h3 className="page-header">
					<Tasks/> Questionnaire
				</h3>
				{sectionRows}
				{this.props.children}
			</div>
		);
	},
});

