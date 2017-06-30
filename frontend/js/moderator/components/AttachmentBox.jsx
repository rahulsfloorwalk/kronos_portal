import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { uploadFileForAuditStore, findAttachmentsByAuditStore, deleteAttachment, renameAttachment } from '../service/attachment.js';

import { Paperclip, Plus, Cross, Record, Picture, Video, File, DownloadAlt } from '../../components/Icons.jsx';
import Loading from '../../components/Loading.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import Jumbotron from '../../components/Jumbotron.jsx';
import InPlaceEditable from '../../components/InPlaceEditable.jsx';

import AttachmentPreview from '../../components/manager/AttachmentPreview.jsx';

import AttachmentProofIcon from '../../components/AttachmentProofIcon.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

var AttachmentItem = React.createClass({
	getDefaultProps: function(){
		return {
			attachment: {}
		};
	},
	render: function(){
		let icon = <AttachmentProofIcon proofType={this.props.attachment.proof_type}/>;
		return (
			<button type="button" className="list-group-item" onClick={()=>this.props.onSelect(this.props.attachment)}>
				{icon} {this.props.attachment.file_name}
			</button>
		);
	}
});

export default React.createClass({
	getInitialState: function(){
		return {
			attachments: [],
			inProgress: {},
			selectedAttachment: undefined
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
	attachmentSelected: function(attachment){
		this.setState({
			selectedAttachment: attachment
		});
	},
	deleteButtonClicked: function(){
		if( this.state.selectedAttachment){
			deleteAttachment(this.state.selectedAttachment.id).then(() => {
				this.setState({
					selectedAttachment: null,
					attachments: this.state.attachments.filter((a) => a.id !== this.state.selectedAttachment.id)
				});
			});
		}
	},
	attachmentRenamed: function(file_name){
		renameAttachment(this.state.selectedAttachment.id, file_name).done((a)=>{
			this.setState({
				selectedAttachment: a
			});
			for( let i in this.state.attachments){
				if(this.state.attachments[i].id === a.id){
					let arr = this.state.attachments;
					arr[i] = a;
					this.setState({
						attachments: arr
					});
				}
			}
		});
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

			let promise = uploadFileForAuditStore(this.props.auditStoreId, toUploadFile);
			promise.progress((type, percent)=>{
				switch(type){
					case "INIT":
						this.setProgressState(tempId, {
							uploadMessage :"initializing upload",
							active: false,
						});
						break;
					case "STARTING_UPLOAD":
						this.setProgressState(tempId, {
							uploadMessage :"starting upload",
							active: true,
						});
						break;
					case "UPLOAD_PROGRESS":
						this.setProgressState(tempId, {
							uploadMessage :"",
							progress: Math.floor(percent)
						});
						break;
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
					progress: ""
				});
			});
		}
	},
	render: function(){
		if(! this.props.auditStore){
			return <Loading/>;
		}

		var attachmentRows = [];
		for(let a of this.state.attachments){
			attachmentRows.push(<AttachmentItem attachment={a} key={a.id} onSelect={this.attachmentSelected}/>);
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
		}

		let editable = this.props.auditStore.status === "SUBMITTED";
		let attachmentElement = <AttachmentPreview attachment={this.state.selectedAttachment} editable={editable}
					onRename={this.attachmentRenamed}
					onDelete={this.deleteButtonClicked}/>

		if(this.props.auditStore.status === 'SUBMITTED'){
			attachmentRows.push(<div key="upload_input" className="hidden">
				<input type="file" onChange={this.uploadFile} multiple
					ref={(input)=>this.uploadInput = input}/>
			</div>);
			attachmentRows.push(<button key="new" onClick={this.uploadButtonClicked} type="button" className="list-group-item"><Plus/> Upload Attachment</button>);
		}

		if( attachmentRows.length === 0){
			return <Jumbotron heading="no attachments here" para="none uploaded"/>;
		} else {

		return (
			<div>
				<h3 className="page-header">
					<Paperclip/> Attachments
				</h3>
				<div className="row">
					<div className="col-md-4" style={{maxHeight:"500px", overflowY: "auto"}}>
						{attachmentRows}
					</div>
					<div className="col-md-8">
						{attachmentElement}
					</div>
				</div>
			</div>
		);
		}
	},
});
