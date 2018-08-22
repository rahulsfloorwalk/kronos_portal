import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { findAttachmentsByAuditStore, uploadFileForAuditStore, deleteAttachment } from '../service/attachment.js';

import { Paperclip, Cross, Record, Picture, Video, File } from '../../components/Icons.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import Loading from '../../components/Loading.jsx';
import Jumbotron from '../../components/Jumbotron.jsx';

import AttachmentThumbnail from '../../components/AttachmentThumbnail.jsx';
import AttachmentInProgressThumbnail from '../../components/AttachmentInProgressThumbnail.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

class AttachmentUploadBox extends React.Component {
    state = {
        uploadMessage : "",
        attachments: [],
        inProgress: {},
        progress: "",
        uploading: false
    };

    reloadState = () => {
		findAttachmentsByAuditStore(this.props.auditStoreId).then((attachments) => {
			this.setState({
				attachments
			});
		});
	};

    componentDidMount() {
		this.reloadState();
	}

    uploadButtonClicked = (e) => {
		this.uploadInput.click();
	};

    setProgressState = (tempId, progressState) => {
		this.setState((prevState)=>{
			return Object.assign({}, prevState, {
				inProgress: Object.assign({}, prevState.inProgress, {
					[tempId]: Object.assign({}, prevState.inProgress[tempId], progressState)
				})
			});
		});
	};

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
					uploadMessage: errorMessage,
					error: true,
				});
			});
		}
	};

    attachmentDeleteClicked = (attachment) => {
		deleteAttachment(attachment.id).then(()=>{
			this.reloadState();
		});
	};

    render() {
		if(! this.props.auditStore){
			return <Loading/>;
		}

		let uploadButton;
		let deletable = false;
		if(this.props.auditStore.status === 'ACKNOWLEDGED'){
			uploadButton = (
				<span>
					<input type="file" multiple
						onChange={this.uploadFile}
						disabled={this.state.uploading}
						ref={(input)=>this.uploadInput = input}
						className="hidden"/>
					<button onClick={this.uploadButtonClicked} type="button" className="btn btn-default">
						<Paperclip/> Upload
					</button>
				</span>);
			deletable = true;
		}

		var attachmentRows = [];

		for(let a of this.state.attachments){
			attachmentRows.push(<AttachmentThumbnail attachment={a} deletable={deletable} onDelete={() => this.attachmentDeleteClicked(a)} key={a.id}/>);
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

		if( attachmentRows.length === 0){
			attachmentRows.push(
				<div key="empty" className="text-muted">
					no attachments here
				</div>
			);
		}

		return (
			<div className="">
				<h3 className="page-header">
					<Paperclip/> Attachments {uploadButton}
				</h3>
				<div className="form-group" style={{}}>
					{attachmentRows}
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

export default ReactRedux.connect(mapStoreToProps)(AttachmentUploadBox);
