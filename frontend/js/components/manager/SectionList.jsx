import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Panel from '../Panel.jsx';

import { fetchSections } from '../../manager/actions/section.js'

var QuestionRow = React.createClass({
	render: function(){
		return (
			<tr>
				<td>{this.props.q.sequence}</td>
				<td>{this.props.q.question_txt}</td>
				<td>{this.props.q.max_marks}</td>
				<td>
					<Link to={`section/${this.props.q.section_id}/question/${this.props.q.id}/edit`} className="btn btn-default">E</Link>
					<Link to={`section/${this.props.q.section_id}/question/${this.props.q.id}/delete`} className="btn btn-default">D</Link>
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
				questionRows.push(<QuestionRow q={q} key={q.id}/>);
			}
		}
		var styles = {
			col1: { width: "5%" },
			col2: { width: "80%" },
			col3: { width: "5%" },
			col4: { width: "10%" },
		};
		return (
			<Panel title={this.props.section.name} noBody={true}>
				<table>
					<thead>
						<tr>
							<th style={styles.col1}>#</th>
							<th style={styles.col2}>Question</th>
							<th style={styles.col3}>Max. Marks</th>
							<th style={styles.col4}>
								<Link to={`section/${this.props.section.id}/questions/add`} className="btn btn-default">New Question</Link>
							</th>
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

var SectionList = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchSections(this.props.auditCycleId));
	},
	render: function(){
		var sectionRows = [];
		for(var sectionId in this.props.sections) {
			sectionRows.push(<Section section={this.props.sections[sectionId]} key={sectionId}/>);
		}
		return (
			<div>
				<h2 className="page-header">
					<Link to={`/audit_cycle/${this.props.auditCycleId}/section/add`} className="btn btn-default pull-right">
						Add Section
					</Link>
					Questionnaire
				</h2>
				{sectionRows}
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		sections: store.sections
	};
};

export default ReactRedux.connect(mapStoreToProps)(SectionList);
