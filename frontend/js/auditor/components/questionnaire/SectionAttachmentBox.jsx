import React from "react";
import PropTypes from "prop-types";
import { } from "react-router";

import { Paperclip } from "../../../components/Icons.jsx";

import AttachmentThumbnail from "../../../components/AttachmentThumbnail.jsx";
import AttachmentInProgressThumbnail from "../../../components/AttachmentInProgressThumbnail.jsx";

import { findAttachmentsByAuditStoreAndSection, uploadFileForReportSection, deleteAttachment } from "../../../auditor/service/attachment.js";

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
		minimumAttachmentCount: PropTypes.number,
		showErrors: PropTypes.bool,
	};

	constructor(props){
		super(props);
		this.state = {
			attachments: [],
			inProgress: {},
		};
	}
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
		for( let toUploadFile of this.uploadInput.files){
			let tempId = Math.random().toString(36).substring(7);
			this.setProgressState(tempId, {
				uploading: true,
				file: toUploadFile
			});
			var promise = uploadFileForReportSection(this.props.auditStoreId, this.props.sectionId, toUploadFile);
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
		if(this.props.auditStore && this.props.auditStore.status === "ACKNOWLEDGED"){
			uploadButton = (<button onClick={this.uploadButtonClicked} type="button" className="btn btn-default btn-sm" style={{
			}}><Paperclip/> Upload</button>);
		}

		let attachmentRows = [];
		for(let a of this.state.attachments){
			let deletable = this.props.auditStore && this.props.auditStore.status === "ACKNOWLEDGED";
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
		let minimumAttachmentCount, panelStyle;
		if( this.props.minimumAttachmentCount) {
			minimumAttachmentCount = <span>(atleast {this.props.minimumAttachmentCount})</span>;
			if(this.props.showErrors && this.state.attachments.length < this.props.minimumAttachmentCount) {
				panelStyle = {
					backgroundColor: "#F2DEDE",
				};
			}
			if(this.state.attachments.length >= this.props.minimumAttachmentCount){
				panelStyle = {
					backgroundColor: "#DFF0D8",
				};
			}
		}
		return (
			<div className="panel-body " style={panelStyle}>
				<h4>Attachments {uploadButton} {minimumAttachmentCount}</h4>
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
