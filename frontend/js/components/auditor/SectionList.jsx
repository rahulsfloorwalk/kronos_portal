import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import QuestionRow from './QuestionRow.jsx';

import Jumbotron from '../Jumbotron.jsx';
import Panel from '../Panel.jsx';
import { Plus, Cross, Pencil } from '../Icons.jsx';

import { affectInputEventToComponent, orderKeys } from '../../react_utils.js'

import { fetchSections } from '../../auditor/actions/section.js';
import { fetchAnswers } from '../../auditor/actions/answer.js';
import { submitAuditorComment, fetchReportSections } from '../../auditor/actions/report_section.js';

var __Section = React.createClass({
	getInitialState: function(){
		return {
			commenting: false,
			auditor_comment: "",
		};
	},
	componentDidMount: function(){
		if(this.props.reportSection){
			this.setState({
				auditor_comment: this.props.reportSection.auditor_comment
			});
		}
	},
	componentWillReceiveProps: function(nextProps){
		if(nextProps.reportSection){
			this.setState({
				auditor_comment: nextProps.reportSection.auditor_comment
			});
		}
	},
	startEdit: function(e){
		e.preventDefault();
		if(this.props.auditStore && this.props.auditStore.status === 'ASSIGNED' && !this.state.commenting){
			this.setState({
				commenting: true
			});
		}
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	componentDidUpdate: function(prevProps, prevState){
		if(this.commentInput && prevState.commenting === false){
			this.commentInput.focus();
			let l = this.commentInput.value.length;
			this.commentInput.setSelectionRange(l,l);
		}
	},
	submitComment: function(e){
		e.preventDefault();
		this.setState({
			commenting: false,
			saving: true,
		});
		var payload = {
			sectionId: this.props.section.id,
			auditor_comment: this.state.auditor_comment,
			audit_store: this.props.auditStoreId,
		};
		console.log("this.props",this.props);
		console.log("payload",payload);
		this.props.dispatch(submitAuditorComment(payload)).then(() => this.setState({saving: false}));
	},
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

		let pointerStyle = {cursor: 'pointer'};
		if(this.props.auditStore && this.props.auditStore.status === 'ASSIGNED'){
			var defaultComment = "click to add comment";
		}
		let auditor_comment = this.state.auditor_comment || (<span className="text-muted">{defaultComment}</span>);
		if(this.state.commenting){
			var commentElement = (
					<form className="input-group" onSubmit={this.submitComment}>
						<input
							className="form-control"
							name="auditor_comment"
							value={this.state.auditor_comment}
							onBlur={this.submitComment}
							onChange={this.inputChanged}
							ref={(input) => this.commentInput = input}
						/>
						<span className="input-group-btn">
							<button className="btn btn-primary">Save</button>
						</span>
					</form>
			);
		} else {
			var commentElement = (<p style={pointerStyle} onClick={this.startEdit}>{auditor_comment}</p>);
		}

		if(this.state.saving){
			var savingMessage = (<span className="text-warning">&nbsp;&nbsp;&nbsp;saving...</span>);
		}

		var styles = {
			col1: { width: "5%" },
			col2: { width: "95%" },
		};
		return (
			<Panel title={`${this.props.section.sequence} - ${this.props.section.name}`} noBody={true}>
				<table className="table table-striped">
					<thead>
						<tr>
							<th style={styles.col1}>#</th>
							<th style={styles.col2}>Question</th>
						</tr>
					</thead>
					<tbody>
						{questionRows}
					</tbody>
				</table>
				<div className="panel-footer">
					<p><b>Section Summary:</b>{savingMessage}</p>
					{commentElement}
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
		})(store.reportSections),
		auditStore: store.auditStores[ownProps.auditStoreId]
	};
};

var Section = ReactRedux.connect(mapStoreToSectionProps)(__Section);

var SectionList = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		console.log("SectionList#componentDidMount");
		this.props.dispatch(fetchSections(this.props.params.auditStoreId));
		this.props.dispatch(fetchAnswers(this.props.params.auditStoreId));
		this.props.dispatch(fetchReportSections(this.props.params.auditStoreId));
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
