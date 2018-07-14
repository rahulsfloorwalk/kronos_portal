import React from "react";
import PropTypes from "prop-types";
import { } from "react-router";

import { Paperclip } from "../../../components/Icons.jsx";

import AttachmentThumbnail from "../../../components/AttachmentThumbnail.jsx";
import AttachmentInProgressThumbnail from "../../../components/AttachmentInProgressThumbnail.jsx";

import { findAttachmentsByAuditStoreAndSection, uploadFileForReportSection, deleteAttachment } from "../../service/attachment.js";

export default class SectionAttachmentBox extends React.Component{

	static propTypes = {
		auditStoreId: PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.string,
		]).isRequired,
		sectionId: PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.string,
		]).isRequired,
		auditStore: PropTypes.object,
	};

	state = {
		attachments: [],
		inProgress: {},
	};

	reloadAttachments = (auditStoreId, sectionId) => {
		findAttachmentsByAuditStoreAndSection(auditStoreId, sectionId).then((attachments) => {
			this.setState({
				attachments
			});
		});
	};

	componentDidMount(){
		this.reloadAttachments(this.props.auditStoreId, this.props.sectionId);
	}

	componentWillReceiveProps(nextProps){
		if( nextProps.auditStoreId !== this.props.auditStoreId || nextProps.sectionId !== this.props.sectionId){
			this.reloadAttachments(nextProps.auditStoreId, nextProps.sectionId);
		}
	}

	uploadButtonClicked = () => {
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

	attachmentDeleteClicked = (attachment) => {
		deleteAttachment(attachment.id).then(()=>{
			this.reloadAttachments(this.props.auditStoreId, this.props.sectionId);
		});
	};

	uploadFile = () => {
		if( this.uploadInput.files.length > 10){
			alert("You can only upload 10 attachments at once");
			return;
		}
		for( const toUploadFile of this.uploadInput.files){
			const tempId = Math.random().toString(36).substring(7);
			this.setProgressState(tempId, {
				uploading: true,
				file: toUploadFile
			});
			const promise = uploadFileForReportSection(this.props.auditStoreId, this.props.sectionId, toUploadFile, (type, percent)=>{
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
			promise.finally(()=>{
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
				this.reloadAttachments(this.props.auditStoreId, this.props.sectionId);
			}, (errorMessage) => {
				this.setProgressState(tempId, {
					uploadMessage: errorMessage,
					error: true,
				});
			});
		}
	};

	render(){
		let uploadButton;
		if(this.props.auditStore && this.props.auditStore.is_editable_by_auditor){
			uploadButton = (<button onClick={this.uploadButtonClicked} type="button" className="btn btn-default btn-sm" style={{
			}}><Paperclip/> Upload</button>);
		}

		const attachmentRows = [];
		for(const a of this.state.attachments){
			const deletable = this.props.auditStore && this.props.auditStore.is_editable_by_auditor;
			attachmentRows.push(<AttachmentThumbnail
				key={a.id}
				attachment={a}
				deletable={deletable}
				onDelete={() => this.attachmentDeleteClicked(a)}
			/>);
		}
		for(const id in this.state.inProgress){
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
			<div className="panel-body">
				<h4>Attachments {uploadButton}</h4>
				{attachmentRows}
				<input type="file" multiple
					onChange={this.uploadFile}
					disabled={this.state.uploading}
					ref={(input)=>this.uploadInput = input}
					style={{"display":"none"}}/>
			</div>
		);
	}
}
