import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { findAttachmentsByUser, uploadFileForUser, deleteAttachment } from '../../auditor/service/attachment.js';

import { Paperclip, Cross, Record, Picture, Video, File } from '../Icons.jsx';
import ProgressBar from '../ProgressBar.jsx';
import Loading from '../Loading.jsx';
import Jumbotron from '../Jumbotron.jsx';
import AttachmentProofIcon from '../AttachmentProofIcon.jsx';


var AttachmentItem = React.createClass({
	getDefaultProps: function(){
		return {
			deletable: false,
			onDelete: () => {},
			attachment: {}
		};
	},
	render: function(){
		let icon = <AttachmentProofIcon proofType={this.props.attachment.proof_type}/>;
		if(this.props.deletable){
			var deleteButton = <button onClick={()=>this.props.onDelete(this.props.attachment)}
					className="btn btn-default btn-sm pull-right"
					title="Delete Attachment"><Cross/>
				</button>;
		}
		return (
			<div className="list-group-item">
				{deleteButton}
				<big>{icon} <a href={this.props.attachment.direct_url} target="_blank" title="Click to download file">
					{this.props.attachment.file_name}
				</a></big>
			</div>
		);
	}
});

var IdProofAttachmentUploadBox = React.createClass({
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
		findAttachmentsByUser().then((attachments) => {
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
			var promise = uploadFileForUser(toUploadFile);
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
					uploadMessage: errorMessage,
					error: true,
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

		let uploadButton = (<button onClick={this.uploadButtonClicked} type="button" className="btn btn-default pull-right"><Paperclip/> Upload</button>);
		let deletable = true;

		var attachmentRows = [];
		for(let a of this.state.attachments){
			attachmentRows.push(<AttachmentItem attachment={a} deletable={deletable} onDelete={this.attachmentDeleteClicked} key={a.id}/>);
		}

		for(let id in this.state.inProgress){
			if(this.state.inProgress[id].uploading){
				let fileName = this.state.inProgress[id].file ? this.state.inProgress[id].file.name : "";
				attachmentRows.push(<div key={id} className="list-group-item">
					<div className="pull-right">
					{this.state.inProgress[id].uploadMessage}
					</div>
					{fileName}<br/>
					<ProgressBar percentage={this.state.inProgress[id].progress} striped={this.state.inProgress[id].active} active={this.state.inProgress[id].active}/>
				</div>);
			}
			if(this.state.inProgress[id].error){
				let fileName = this.state.inProgress[id].file ? this.state.inProgress[id].file.name : "";
				attachmentRows.push(<div key={id} className="list-group-item list-group-item-danger">
					<div className="pull-right">
					<b>{this.state.inProgress[id].uploadMessage}</b>
					</div>
					{fileName}<br/>
				</div>);
			}
		}


		if( attachmentRows.length === 0){
			attachmentRows.push(
				<div key="empty" className="list-group-item text-center text-muted">
					<h4>
						Upload at least one ID Proof<br/>
						<small>only images or PDFs are supported</small>
					</h4>
				</div>
			);
		}

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<input type="file" multiple
						onChange={this.uploadFile}
						disabled={this.state.uploading}
						ref={(input)=>this.uploadInput = input}
						style={{"display":"none"}}/>
						{uploadButton}
					<h4 className="">
						<Paperclip/> ID Proofs
					</h4>
				</div>
				<div className="list-group" style={{"height":"150px", "overflowY":"auto"}}>
					{attachmentRows}
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

export default ReactRedux.connect(mapStoreToProps)(IdProofAttachmentUploadBox);
