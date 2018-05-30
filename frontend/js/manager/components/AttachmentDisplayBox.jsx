import React, { Component } from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Alert from 'react-s-alert';

import { uploadFileForAuditStore, findAttachmentsByAuditStore, deleteAttachment, renameAttachment } from '../service/attachment.js';

import { Paperclip, Plus, Cross, Record, Picture, Video, File, DownloadAlt } from '../../components/Icons.jsx';
import Loading from '../../components/Loading.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import Jumbotron from '../../components/Jumbotron.jsx';
import InPlaceEditable from '../../components/InPlaceEditable.jsx';

import AttachmentPreview from './AttachmentPreview.jsx';

import AttachmentThumbnail from '../../components/AttachmentThumbnail.jsx';
import AttachmentInProgressThumbnail from '../../components/AttachmentInProgressThumbnail.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

export class AttachmentDisplayBox extends Component{
	constructor(props){
		super(props);
		this.state = {
			attachments: [],
			inProgress: {},
			selectedAttachment: undefined
		};
	}
	reloadState = () => {
		findAttachmentsByAuditStore(this.props.auditStoreId).then((attachments) => {
			this.setState({
				attachments
			});
		});
	}
	componentDidMount(){
		this.reloadState();
	}
	attachmentSelected = (attachment) => {
		this.setState({
			selectedAttachment: attachment
		});
	}
	deleteButtonClicked = () => {
		if( this.state.selectedAttachment){
			deleteAttachment(this.state.selectedAttachment.id).then(() => {
				Alert.success("ATTACHMENT DELETED");
				this.setState({
					selectedAttachment: null,
					attachments: this.state.attachments.filter((a) => a.id !== this.state.selectedAttachment.id)
				});
			});
		}
	}
	attachmentRenamed = (file_name) => {
		renameAttachment(this.state.selectedAttachment.id, file_name).then((a)=>{
			Alert.success("ATTACHMENT RENAMED");
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
		}, ()=> {
			Alert.warning("INVALIED FILE NAME");
		});
	}
	uploadButtonClicked = (e) => {
		this.uploadInput.click();
	}
	setProgressState = (tempId, progressState) => {
		this.setState((prevState)=>{
			return Object.assign({}, prevState, {
				inProgress: Object.assign({}, prevState.inProgress, {
					[tempId]: Object.assign({}, prevState.inProgress[tempId], progressState)
				})
			});
		});
	}
	uploadFile = (e) => {
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
					uploadMessage: errorMessage,
					error:true,
					progress: ""
				});
			});
		}
	}
	render(){
		if(! this.props.auditStore){
			return <Loading/>;
		}

		var attachmentRows = [];

		for(let a of this.state.attachments){
			attachmentRows.push(<AttachmentThumbnail attachment={a} key={a.id} onSelect={() => this.attachmentSelected(a)} deletable={false} onSelect={() => this.attachmentSelected(a)} selected={a.id === (this.state.selectedAttachment && this.state.selectedAttachment.id)}/>);
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
		}

		let editable = this.props.auditStore.status === "SUBMITTED" || this.props.auditStore.status === "PM_REVIEW";
		let attachmentElement = <AttachmentPreview attachment={this.state.selectedAttachment} editable={editable}
					onRename={this.attachmentRenamed}
					onDelete={this.deleteButtonClicked}/>

		let uploadButton;
		if(editable){
			uploadButton = (
				<span>
					<input className="hidden" type="file" onChange={this.uploadFile} multiple
						ref={(input)=>this.uploadInput = input}/>
					<button onClick={this.uploadButtonClicked} type="button" className="btn btn-default">
						<Plus/> Upload Attachment
					</button>
				</span>
			);
		}

		if( attachmentRows.length === 0){
			attachmentRows.push(<Jumbotron key="empty" heading="no attachments here" para="none uploaded"/>);
		}

		return (
			<div>
				<h3 className="page-header">
					<Paperclip/> Attachments {uploadButton}
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
}

var mapStoreToProps = function(store, ownProps){
	return {
		auditStore: store.auditStores[ownProps.auditStoreId],
	};
};

export default ReactRedux.connect(mapStoreToProps)(AttachmentDisplayBox);
