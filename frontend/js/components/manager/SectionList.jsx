import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { pointerStyle } from '../../styles.js';

import Jumbotron from '../Jumbotron.jsx';
import Panel from '../Panel.jsx';
import { Duplicate, Tasks, Plus, Cross, Pencil, ChevronRight, ChevronDown } from '../Icons.jsx';

import { orderKeys } from '../../react_utils.js'
import { fetchSections } from '../../manager/actions/section.js'

var QuestionRow = React.createClass({
	render: function(){
		return (
			<tr>
				<td>{this.props.q.sequence}</td>
				<td>{this.props.q.question_txt}</td>
				<td>{this.props.q.max_marks}</td>
				<td>
					<Link to={`/audit_cycle/${this.props.auditCycleId}/questionnaire/section/${this.props.q.section}/question/${this.props.q.id}/edit`} className="btn btn-default"><Pencil/></Link>
				</td>
			</tr>
		);
	},
					//<Link to={`/audit_cycle/${this.props.auditCycleId}/questionnaire/section/${this.props.q.section}/question/${this.props.q.id}/delete`} className="btn btn-default"><Cross/></Link>
});
var Section = React.createClass({
	getInitialState: function(){
		return {
			expanded: false,
		};
	},
	toggleExpanded: function(){
		this.setState({
			expanded: !this.state.expanded,
		});
	},
	render: function(){
		let questionRows = [];
		if( this.props.section.questions){
			for(let q of this.props.section.questions){
				questionRows.push(<QuestionRow auditCycleId={this.props.auditCycleId} q={q} key={q.id}/>);
			}
		}
		if(questionRows.length === 0){
			questionRows.push(<tr key="empty"><td colSpan="4" className="text-center text-muted">no questions here</td></tr>);
		}
		questionRows.push(
			<tr key="new">
			<td colSpan={4} className="text-center">
				<Link to={`/audit_cycle/${this.props.auditCycleId}/questionnaire/section/${this.props.section.id}/question/add`} className="btn btn-default">
					<Plus/> Add Question
				</Link>
			</td>
			</tr>
		);
		var styles = {
			col1: { width: "5%" },
			col2: { width: "80%" },
			col3: { width: "5%" },
			col4: { width: "10%" },
		};

		let expandIcon = (<ChevronRight/>);
		let panelBody = null;//(<div className="panel-footer text-center text-muted"><button onClick={this.toggleExpanded} className="btn btn-link">expand</button></div>);

		if(this.state.expanded){
			expandIcon = (<ChevronDown/>);
			panelBody = (
				<table className="table table-striped">
					<thead>
						<tr>
							<th style={styles.col1}>#</th>
							<th style={styles.col2}>Question</th>
							<th style={styles.col3}>Max. Marks</th>
							<th style={styles.col4}>
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
			);
		}
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<span className="pull-right">
						<b>{this.props.section.questions.length}</b> questions, <b>{this.props.section.max_marks}</b> marks
						&nbsp;
						<Link to={`/audit_cycle/${this.props.auditCycleId}/questionnaire/section/${this.props.section.id}/edit`} className="btn btn-default">
							<Pencil/>
						</Link>
					</span>
					<h4 className="panel-title">
						<a onClick={this.toggleExpanded} style={pointerStyle} className="btn btn-sm btn-default">
							{expandIcon}
						</a>
						&nbsp;
						{this.props.section.sequence} - <b>{this.props.section.name}</b>
					</h4>
				</div>
				{panelBody}
			</div>
		);
	},
});

var SectionList = React.createClass({
	getInitialState: function(){
		return {
			loading: false
		};
	},
	componentDidMount: function() {
		console.log("SectionList#componentDidMount");
		this.setState({
			loading:true
		});
		this.props.dispatch(fetchSections(this.props.params.auditCycleId)).always(() => {
			this.setState({
				loading:false
			});
		});
	},
	componentWillReceiveProps: function(nextProps){
		console.log("SectionList#componentWillReceiveProps");
		if( ! this.state.loading){
			console.debug("hello world", nextProps);
			this.setState({
				loading:true
			});
			this.props.dispatch(fetchSections(this.props.params.auditCycleId)).always(() => {
				console.debug("bye world", nextProps);
				this.setState({
					loading:false
				});
			});
		}
		console.log("SectionList#this.props.children",nextProps.children);
	},
	render: function(){
		var orderedKeys = orderKeys(this.props.sections, function(s1,s2){
			return s1.sequence - s2.sequence;
		});
		var sectionRows = [];
		for(var sectionId of orderedKeys) {
			sectionRows.push(<Section auditCycleId={this.props.params.auditCycleId} section={this.props.sections[sectionId]} key={sectionId}/>);
		}
		if( sectionRows.length === 0){
			sectionRows.push(<Jumbotron key="empty" heading="this questionnaire is empty" para="start by adding a section"/>);
		}
		return (
			<div>
				<h3 className="page-header">
					<span className="pull-right">
					<Link to={`/audit_cycle/${this.props.params.auditCycleId}/questionnaire/section/add`} className="btn btn-default">
						<Plus/> Add Section
					</Link>&nbsp;
					<Link to={`/audit_cycle/${this.props.params.auditCycleId}/questionnaire/section/copy`} className="btn btn-default" title="Copy Sections">
						<Duplicate/>
					</Link>
					</span>
					<Tasks/> Questionnaire
				</h3>
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
