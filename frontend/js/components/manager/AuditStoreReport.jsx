import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Jumbotron from '../Jumbotron.jsx';
import Panel from '../Panel.jsx';
import { Plus, Cross, Pencil } from '../Icons.jsx';

import { orderKeys } from '../../react_utils.js'
import { fetchSections } from '../../manager/actions/section.js'
import { fetchAnswers } from '../../manager/actions/answer.js'
import { fetchReportSections } from '../../manager/actions/report_section.js'

var __QuestionRow = React.createClass({
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
					<Link to={`/audit_cycle/${this.props.auditCycleId}/questionnaire/section/${this.props.q.section}/question/${this.props.q.id}/edit`} className="btn btn-default"><Pencil/></Link>
				</td>
			</tr>
		);
	},
});

var mapStoreToQuestionRowProps = function(store, ownProps){
	return {
		answer: (function(answers){
			for(let id in answers){
				if(answers[id].question === ownProps.q.id){
					console.log("found",answers[id]);
					return answers[id];
				}
			}
		})(store.answers)
	};
};

var QuestionRow = ReactRedux.connect(mapStoreToQuestionRowProps)(__QuestionRow);


var __Section = React.createClass({
	render: function(){
		let questionRows = [];
		if( this.props.section.questions){
			for(let q of this.props.section.questions){
				questionRows.push(<QuestionRow q={q} key={q.id}/>);
			}
		}
		if(questionRows.length === 0){
			questionRows.push(<tr key="empty"><td colSpan="4" className="text-center text-muted">no questions here</td></tr>);
		}
		if(this.props.reportSection){
			var auditor_comment = this.props.reportSection.auditor_comment;
			var pm_comment = this.props.reportSection.pm_comment;
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
							<th style={styles.col6}>
								<Link to={`/audit_cycle/${this.props.auditCycleId}/questionnaire/section/${this.props.section.id}/question/add`} className="btn btn-default">
									<Plus/>
								</Link>
							</th>
						</tr>
					</thead>
					<tbody>
						{questionRows}
					</tbody>
				</table>
				<div className="panel-footer">
					<p><b>Auditor Comment:</b> {auditor_comment}</p>
					<p><b>PM Comment:</b> {pm_comment}</p>
				</div>
			</Panel>
		);
	},
});

var mapStoreToSectionProps = function(store, ownProps){
	return {
		reportSection: (function(reportSections){
			for(let id in reportSections){
				if(reportSections[id].section === ownProps.section.id){
					console.log("found REPORT SECTION",reportSections[id]);
					return reportSections[id];
				}
			}
		})(store.reportSections)
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
			sectionRows.push(<Section section={this.props.sections[sectionId]} key={sectionId}/>);
		}
		if( sectionRows.length === 0){
			sectionRows.push(<Jumbotron key="empty" heading="this questionnaire is empty" para="please add a section from the questionnaire"/>);
		}
		return (
			<div>
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
