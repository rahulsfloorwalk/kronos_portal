import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { truncateStyle } from '../../styles.js';

import QuestionRow from './QuestionRow.jsx';
import AttachmentThumbnail from '../AttachmentThumbnail.jsx';
import AttachmentInProgressThumbnail from '../AttachmentInProgressThumbnail.jsx';

import Jumbotron from '../Jumbotron.jsx';
import Panel from '../Panel.jsx';
import { Plus, Cross, Pencil, Paperclip } from '../Icons.jsx';

import { affectInputEventToComponent, orderKeys } from '../../react_utils.js'

import { findAttachmentsByAuditStoreAndSection, uploadFileForReportSection, deleteAttachment } from '../../auditor/service/attachment.js';
import { fetchSections } from '../../auditor/actions/section.js';
import { fetchAnswers } from '../../auditor/actions/answer.js';
import { submitAuditorComment, fetchReportSections } from '../../auditor/actions/report_section.js';

var __Section = React.createClass({
	getInitialState: function(){
		return {
			commenting: false,
			auditor_comment: "",
			attachments: [],
			inProgress: {},
		};
	},
	reloadAttachments: function(){
		findAttachmentsByAuditStoreAndSection(this.props.auditStoreId, this.props.section.id).then((attachments) => {
			this.setState({
				attachments
			});
		});
	},
	componentDidMount: function(){
		if(this.props.reportSection){
			this.setState({
				auditor_comment: this.props.reportSection.auditor_comment
			});
		}
		this.reloadAttachments();
	},
	componentWillReceiveProps: function(nextProps){
		if(nextProps.reportSection){
			this.setState({
				auditor_comment: nextProps.reportSection.auditor_comment
			});
		}
		this.reloadAttachments();
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
		//console.log("this.props",this.props);
		//console.log("payload",payload);
		this.props.dispatch(submitAuditorComment(payload)).then(() => this.setState({saving: false}));
	},
	uploadButtonClicked: function(e){
		this.uploadInput.click();
	},
	setProgressState: function(tempId, progressState){
		this.setState((prevState)=>{
			return Object.assign({}, prevState, {
				inProgress: Object.assign({}, prevState.inProgress, {
					[tempId]: Object.assign({}, prevState.inProgress[tempId], progressState)
				})
			});
		});
	},
	attachmentDeleteClicked: function(attachment){
		deleteAttachment(attachment.id).then(()=>{
			this.reloadAttachments();
		});
	},
	uploadFile: function(e){
		if( this.uploadInput.files.length > 10){
			alert("You can only upload 10 attachments at once");
			return;
		}
		for( let toUploadFile of this.uploadInput.files){
			let tempId = Math.random().toString(36).substring(7);
			this.setProgressState(tempId, {
				uploading: true,
				file: toUploadFile
			});
			var promise = uploadFileForReportSection(this.props.auditStoreId, this.props.section.id, toUploadFile);
			promise.progress((type, percent)=>{
				if(type === "INIT"){
					this.setProgressState(tempId, {
						uploadMessage :"initializing upload",
						active: false,
					});
				}
				if(type === "STARTING_UPLOAD"){
					this.setProgressState(tempId, {
						uploadMessage :"starting upload",
						active: true,
					});
				}
				if(type === "UPLOAD_PROGRESS"){
					this.setProgressState(tempId, {
						uploadMessage :"",
						progress: Math.floor(percent)
					});
				}
			});
			promise.always(()=>{
				this.setProgressState(tempId, {
					progress :"",
					uploading:false,
					active: false
				});
			});
			promise.then(()=>{
				this.setProgressState(tempId, {
					uploadMessage :"upload successful",
				});
				this.reloadAttachments();
			}, (errorMessage) => {
				this.setProgressState(tempId, {
					uploadMessage: errorMessage,
					error: true,
				});
			});
		}
	},
	render: function(){
		let uploadButton;
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
			uploadButton = (<button onClick={this.uploadButtonClicked} type="button" className="btn btn-default btn-sm" style={{
			}}><Paperclip/> Upload</button>);
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

		let attachmentRows = [];
		for(let a of this.state.attachments){
			let deletable = this.props.auditStore && this.props.auditStore.status === 'ASSIGNED';
			attachmentRows.push(<AttachmentThumbnail
				key={a.id}
				attachment={a}
				deletable={deletable}
				onDelete={() => this.attachmentDeleteClicked(a)}
			/>);
		}
		for(let id in this.state.inProgress){
			if(this.state.inProgress[id].uploading || this.state.inProgress[id].error){
				let fileName = this.state.inProgress[id].file ? this.state.inProgress[id].file.name : "";
				attachmentRows.push(<AttachmentInProgressThumbnail
					key={id}
					fileName={fileName}
					progress={this.state.inProgress[id].progress}
					uploadMessage={this.state.inProgress[id].uploadMessage}
					error={this.state.inProgress[id].error}
				/>);
			}
			attachmentRows.push(" ");
		}
		if( attachmentRows.length === 0){
			attachmentRows.push(<span key="empty" className="text-muted">no attachments here&nbsp;</span>);
		}
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
				<div className="panel-body">
				<h4>Attachments {uploadButton}</h4>
				{attachmentRows}
					<input type="file" multiple
						onChange={this.uploadFile}
						disabled={this.state.uploading}
						ref={(input)=>this.uploadInput = input}
						style={{"display":"none"}}/>
				</div>
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
