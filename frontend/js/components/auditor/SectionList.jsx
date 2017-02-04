import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Jumbotron from '../Jumbotron.jsx';
import Panel from '../Panel.jsx';
import { Plus, Cross, Pencil } from '../Icons.jsx';

import { orderKeys } from '../../react_utils.js'

import { fetchSections } from '../../auditor/actions/section.js';

var QuestionRow = React.createClass({
	render: function(){
		return (
			<tr>
				<td>{this.props.q.sequence}</td>
				<td>{this.props.q.question_txt}</td>
				<td>{this.props.q.max_marks}</td>
				<td>
					<Link to={`/audit_store/${this.props.auditStoreId}/section/question/${this.props.q.id}/answer`} className="btn btn-default"><Pencil/></Link>
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
				questionRows.push(<QuestionRow auditStoreId={this.props.auditStoreId} q={q} key={q.id}/>);
			}
		}
		if(questionRows.length === 0){
			questionRows.push(<tr key="empty"><td colSpan="4" className="text-center text-muted">no questions here</td></tr>);
		}
		var styles = {
			col1: { width: "5%" },
			col2: { width: "80%" },
			col3: { width: "20%" },
		};
		return (
			<Panel title={`${this.props.section.sequence} - ${this.props.section.name}`} noBody={true}>
				<table className="table table-striped">
					<thead>
						<tr>
							<th style={styles.col1}>#</th>
							<th style={styles.col2}>Question</th>
							<th style={styles.col3}>Answer</th>
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
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		console.log("SectionList#componentDidMount");
		this.props.dispatch(fetchSections(this.props.params.auditStoreId));
	},
	/*componentWillReceiveProps: function(nextProps){
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
	},*/
	render: function(){
		var orderedKeys = orderKeys(this.props.sections, function(s1,s2){
			return s1.sequence - s2.sequence;
		});
		var sectionRows = [];
		for(var sectionId of orderedKeys) {
			sectionRows.push(<Section auditStoreId={this.props.params.auditStoreId} section={this.props.sections[sectionId]} key={sectionId}/>);
		}
		if( sectionRows.length === 0){
			sectionRows.push(<Jumbotron key="empty" heading="this questionnaire is empty" para="please contact support"/>);
		}
		return (
			<div>
				<h3 className="page-header">Report Details</h3>
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
