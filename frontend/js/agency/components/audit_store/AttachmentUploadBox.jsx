import $ from "jquery";
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { findAttachmentsByAuditStore, uploadFileForAuditStore, deleteAttachment, moveAttachmentToSection } from "../../service/attachment.js";

import { Paperclip } from "../../../components/Icons.jsx";
import Loading from "../../../components/Loading.jsx";

import AttachmentThumbnail from "../../../components/AttachmentThumbnail.jsx";
import AttachmentInProgressThumbnail from "../../../components/AttachmentInProgressThumbnail.jsx";

import { auditStorePropType } from "../../prop_types.js";
import { findAuditStore } from "../../reducers/audit_store.js";
import { findSectionsByAuditStoreId } from "../../reducers/section.js";

class __AttachmentUploadBox extends React.Component {
	static propTypes = {
		auditStoreId: PropTypes.number.isRequired,
		auditStore: auditStorePropType.isRequired,
		sections: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			sequence: PropTypes.number.isRequired,
		})),
		editable:PropTypes.bool
	};

	state = {
		uploadMessage : "",
		attachments: [],
		inProgress: {},
		progress: "",
		uploading: false,
		sectionId:"",
		submitMessage : "",
		submitStatus: "",
		showErrors: false,
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

	getSectionId = (e) => {
		this.setState({
			sectionId : e.target.value
		});
	};

	moveAttachment = () => {
		let attachmentlist = [];
		$('.attachment_checkbox input:checked').each(function() {
			let val = $(this).attr('value');
			attachmentlist.push(val);
		});
		
		moveAttachmentToSection(this.props.auditStoreId,this.state.sectionId,attachmentlist).then(() => {
			window.location.reload();
		},(err) => {
			this.setState({
				submitMessage : err.responseJSON.non_field_errors[0],
				submitStatus: "danger",
				showErrors: true,
			});
		});
		
	};

	render() {
		var contentStyle = {
			"paddingTop": "2%"
		};
		
		let submitMessageElement = <big><b className={this.state.submitStatus ? "text-" + this.state.submitStatus : ""}>{this.state.submitMessage}</b></big>;
		
		if(! this.props.auditStore){
			return <Loading/>;
		}

		let uploadButton;
		const deletable = this.props.auditStore.is_editable_by_agency;
		if(this.props.auditStore.is_editable_by_agency){
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
			attachmentRows.push(<AttachmentThumbnail attachment={a} deletable={deletable} onDelete={() => this.attachmentDeleteClicked(a)} key={a.id} user="agency" editable={this.props.editable}/>);
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
		var selectSection = null;
		if( attachmentRows.length === 0){
			attachmentRows.push(
				<div key="empty" className="text-muted">
					no attachments here
				</div>
			);
		}
		else{
			if(this.props.editable){
				selectSection = (
					<div className="col-md-4" style={contentStyle}>
							<div className="col-md-8">
								<select className="form-control" onChange={this.getSectionId}>
									<option value="">Select Section</option>
									{this.props.sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option> )}
								</select>
							</div>
							<div className="col-md-2">
								<button className="btn btn-default btn-sm" onClick={this.moveAttachment}>Move to</button>
							</div>
					</div>
				);
			}
		}

		return (
			<div>
				<div className="row page-header">
					<div className="col-md-8">
					<h3>
						<Paperclip/> Attachments {uploadButton}
					</h3>
					{submitMessageElement}
					</div>
					{selectSection}
				</div>	
				<div className="row">	
					<div className="form-group attachment_checkbox" style={{}}>
						{attachmentRows}
					</div>
				</div>
			</div>
		);
	}
}

const mapStoreToProps = (store, ownProps) => {
	const auditStore = findAuditStore(store, ownProps.auditStoreId);
	return {
		auditStore: findAuditStore(store, ownProps.auditStoreId),
		sections: findSectionsByAuditStoreId(store, ownProps.auditStoreId),
		editable: auditStore && auditStore.is_editable_by_agency,
	};
};

const AttachmentUploadBox = connect(mapStoreToProps)(__AttachmentUploadBox);

AttachmentUploadBox.propTypes = {
	auditStoreId: PropTypes.number.isRequired,
};

export default AttachmentUploadBox;
