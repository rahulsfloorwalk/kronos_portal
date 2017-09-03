import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import {url}  from '../../../config.js';

import { pointerStyle } from '../../styles.js';

import Jumbotron from '../Jumbotron.jsx';
import Panel from '../Panel.jsx';
import { Duplicate, Tasks, Plus, Cross, Pencil, ChevronRight, ChevronDown, Download } from '../Icons.jsx';

import { orderKeys } from '../../react_utils.js'
import { getQuestionType } from '../../utils.js';
import { fetchSections, deleteSection } from '../../manager/actions/section.js'
import { deleteQuestion } from '../../manager/service/question.js';

var QuestionRow = React.createClass({
	render: function(){
		return (
			<tr>
				<td>{this.props.q.sequence}</td>
				<td>
					{this.props.q.question_txt}<br/>
					<span className="text-muted">{
						this.props.q.question_type === "MUTEX"
						? this.props.q.question_data.options.map(o => o.value).join(' / ')
						: null
					}</span>
				</td>
				<td>{getQuestionType(this.props.q.question_type)}</td>
				<td>{this.props.q.max_marks}</td>
				<td>
					<Link to={`/audit_cycle/${this.props.auditCycleId}/questionnaire/section/${this.props.q.section}/question/${this.props.q.id}/edit`} className="btn btn-default"><Pencil/></Link>
					<button type="button" onClick={this.props.onDelete ? () => this.props.onDelete(this.props.q): ()=>{}} className="btn btn-default" title="Delete Question"><Cross/></button>
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
	onQuestionDelete: function(question){
		deleteQuestion(question.id).then(() => this.props.onChange && this.props.onChange());
	},
	render: function(){
		let questionRows = [];
		if( this.props.section.questions){
			for(let q of this.props.section.questions){
				questionRows.push(<QuestionRow auditCycleId={this.props.auditCycleId} q={q} key={q.id} onDelete={this.onQuestionDelete}/>);
			}
		}
		if(questionRows.length === 0){
			questionRows.push(<tr key="empty"><td colSpan="5" className="text-center text-muted">no questions here</td></tr>);
		}
		questionRows.push(
			<tr key="new">
			<td colSpan={5} className="text-center">
				<Link to={`/audit_cycle/${this.props.auditCycleId}/questionnaire/section/${this.props.section.id}/question/add`} className="btn btn-default">
					<Plus/> Add Question
				</Link>
			</td>
			</tr>
		);

		let expandIcon = (<ChevronRight/>);
		let panelBody = null;//(<div className="panel-footer text-center text-muted"><button onClick={this.toggleExpanded} className="btn btn-link">expand</button></div>);

		if(this.state.expanded){
			expandIcon = (<ChevronDown/>);
			panelBody = (
				<table className="table table-striped">
					<colgroup>
						<col style={{width:"5%"}}/>
						<col style={{width:"70%"}}/>
						<col style={{width:"10%"}}/>
						<col style={{width:"5%"}}/>
						<col style={{width:"10%"}}/>
					</colgroup>
					<thead>
						<tr>
							<th>#</th>
							<th>Question</th>
							<th>Question Type</th>
							<th>Max. Marks</th>
							<th>
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
						<button type="button" onClick={this.props.onDelete ? () => this.props.onDelete(this.props.section): ()=>{}} className="btn btn-default" title="Delete Section"><Cross/></button>
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
	reloadData: function(auditCycleId){
		this.setState({
			loading:true
		});
		this.props.dispatch(fetchSections(auditCycleId)).always(() => {
			this.setState({
				loading:false
			});
		});
	},
	componentDidMount: function() {
		this.reloadData(this.props.params.auditCycleId);
	},
	componentWillReceiveProps: function(nextProps){
		if( ! this.state.loading){
			this.reloadData(nextProps.params.auditCycleId);
		}
	},
	onSectionDelete: function(section){
		this.props.dispatch(deleteSection(section.id));
	},
	render: function(){
		var orderedKeys = orderKeys(this.props.sections, function(s1,s2){
			return s1.sequence - s2.sequence;
		});
		var sectionRows = [];
		for(var sectionId of orderedKeys) {
			sectionRows.push(<Section auditCycleId={this.props.params.auditCycleId} section={this.props.sections[sectionId]} key={sectionId} onChange={() => this.reloadData(this.props.params.auditCycleId)} onDelete={this.onSectionDelete}/>);
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
						<Duplicate/> Copy Sections
					</Link>&nbsp;
					<a className="btn btn-default pull-right" href={url.api_base_path + 'manager/audit_cycle/' + this.props.params.auditCycleId + '/import_questionnaire'}>
              <Download/> Import
          </a>
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
