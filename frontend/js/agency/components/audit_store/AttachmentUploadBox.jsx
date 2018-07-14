import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { findAttachmentsByAuditStore, uploadFileForAuditStore, deleteAttachment } from "../../service/attachment.js";

import { Paperclip } from "../../../components/Icons.jsx";
import Loading from "../../../components/Loading.jsx";

import AttachmentThumbnail from "../../../components/AttachmentThumbnail.jsx";
import AttachmentInProgressThumbnail from "../../../components/AttachmentInProgressThumbnail.jsx";

import { auditStorePropType } from "../../prop_types.js";

class __AttachmentUploadBox extends React.Component {
	static propTypes = {
		auditStoreId: PropTypes.number.isRequired,
		auditStore: auditStorePropType.isRequired,
	};

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

	uploadButtonClicked = () => {
		this.uploadInput && this.uploadInput.click();
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
			const promise = uploadFileForAuditStore(this.props.auditStoreId, toUploadFile, (type, percent) => {
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
		const deletable = this.props.auditStore.is_editable_by_auditor;
		if(this.props.auditStore.is_editable_by_auditor){
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
		}

		const attachmentRows = [];

		for(const a of this.state.attachments){
			attachmentRows.push(<AttachmentThumbnail attachment={a} deletable={deletable} onDelete={() => this.attachmentDeleteClicked(a)} key={a.id}/>);
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


const findAuditStore = (store, auditStoreId) => {
	return store.auditStores.find((as) => as.id === auditStoreId);
};

const mapStoreToProps = (store, ownProps) => {
	return {
		auditStore: findAuditStore(store, ownProps.auditStoreId),
	};
};

const AttachmentUploadBox = connect(mapStoreToProps)(__AttachmentUploadBox);

AttachmentUploadBox.propTypes = {
	auditStoreId: PropTypes.number.isRequired,
};

export default AttachmentUploadBox;
