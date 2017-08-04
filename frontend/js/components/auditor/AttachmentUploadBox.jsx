import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { findAttachmentsByAuditStore, uploadFileForAuditStore, deleteAttachment } from '../../auditor/service/attachment.js';

import { Paperclip, Cross, Record, Picture, Video, File } from '../Icons.jsx';
import ProgressBar from '../ProgressBar.jsx';
import Loading from '../Loading.jsx';
import Jumbotron from '../Jumbotron.jsx';

import AttachmentThumbnail from '../AttachmentThumbnail.jsx';
import AttachmentInProgressThumbnail from '../AttachmentInProgressThumbnail.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

var AttachmentUploadBox = React.createClass({
	getInitialState: function(){
		return {
			uploadMessage : "",
			attachments: [],
			inProgress: {},
			progress: "",
			uploading: false
		};
	},
	reloadState: function(){
		findAttachmentsByAuditStore(this.props.auditStoreId).then((attachments) => {
			this.setState({
				attachments
			});
		});
	},
	componentDidMount: function(){
		this.reloadState();
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
			var promise = uploadFileForAuditStore(this.props.auditStoreId, toUploadFile);
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
				this.reloadState();
			}, (errorMessage) => {
				this.setProgressState(tempId, {
					uploadMessage :"upload failed: " + errorMessage,
				});
			});
		}
	},
	attachmentDeleteClicked: function(attachment){
		deleteAttachment(attachment.id).then(()=>{
			this.reloadState();
		});
	},
	render: function(){
		if(! this.props.auditStore){
			return <Loading/>;
		}

		let uploadButton;
		let deletable = false;
		if(this.props.auditStore.status === 'ASSIGNED'){
			uploadButton = (<button onClick={this.uploadButtonClicked} type="button" className="btn btn-default"><Paperclip/> Upload</button>);
			deletable = true;
		}

		var attachmentRows = [];

		for(let a of this.state.attachments){
			attachmentRows.push(<AttachmentThumbnail attachment={a} deletable={deletable} onDelete={() => this.attachmentDeleteClicked(a)} key={a.id}/>);
		}

		for(let id in this.state.inProgress){
			if(this.state.inProgress[id].uploading){
				let fileName = this.state.inProgress[id].file ? this.state.inProgress[id].file.name : "";
				attachmentRows.push(<AttachmentInProgressThumbnail
					key={id}
					fileName={fileName}
					progress={this.state.inProgress[id].progress}
					uploadMessage={this.state.inProgress[id].uploadMessage}
				/>);
			}
		}

		if( attachmentRows.length === 0){
			attachmentRows.push(
				<div key="empty" className="list-group-item text-center text-muted">
					<h4>no attachments here</h4>
				</div>
			);
		}

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h4 className="panel-title">
						<Paperclip/> Attachments
					</h4>
				</div>
				<div className="list-group" style={{"minHeight":"239px", "maxHeight":"250px", "overflowY":"auto"}}>
					{attachmentRows}
				</div>
				<div className="panel-footer text-right">
					<input type="file" multiple
						onChange={this.uploadFile} 
						disabled={this.state.uploading}
						ref={(input)=>this.uploadInput = input}
						style={{"display":"none"}}/>
						{uploadButton}
				</div>
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		auditStore: store.auditStores[ownProps.auditStoreId],
	};
};

export default ReactRedux.connect(mapStoreToProps)(AttachmentUploadBox);
