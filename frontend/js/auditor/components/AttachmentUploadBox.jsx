import $ from "jquery";
import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { orderKeys } from "../../react_utils.js";
import { findAttachmentsByAuditStore, uploadFileForAuditStore, deleteAttachment , moveAttachmentToSection } from "../service/attachment.js";

import { Paperclip } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";

import AttachmentThumbnail from "../../components/AttachmentThumbnail.jsx";
import AttachmentInProgressThumbnail from "../../components/AttachmentInProgressThumbnail.jsx";

import { auditStorePropType } from "../prop_types";

import { fetchSections } from "../actions/section.js";

class AttachmentUploadBox extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		auditStoreId: PropTypes.oneOfType([ PropTypes.number, PropTypes.string, ]),
		auditStore: auditStorePropType,
		editable:PropTypes.bool,
		sections:PropTypes.object
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
		this.props.dispatch(fetchSections(this.props.auditStoreId));
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

	getSectionId = (e) => {
		this.setState({
			sectionId : e.target.value
		});
	};

	moveAttachment = () => {
		let attachmentlist = [];
		$(".attachment_checkbox input:checked").each(function() {
			let val = $(this).attr("value");
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
		if(! this.props.auditStore){
			return <Loading/>;
		}

		var contentStyle = {
			"paddingTop": "2%"
		};

		let submitMessageElement = <big><b className={this.state.submitStatus ? "text-" + this.state.submitStatus : ""}>{this.state.submitMessage}</b></big>;

		let uploadButton;
		let deletable = false;
		if(this.props.auditStore.status === "ACKNOWLEDGED"){
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
			attachmentRows.push(<AttachmentThumbnail attachment={a} deletable={deletable} onDelete={() => this.attachmentDeleteClicked(a)} key={a.id} user="auditor" editable={this.props.editable} faulty_report_id=""/>);
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

		var selectSection = null;
		if( attachmentRows.length === 0){
			attachmentRows.push(
				<div key="empty" className="text-muted">
						no attachments here
				</div>
			);
		}
		else{
			if (this.props.editable){
				var orderedKeys = orderKeys(this.props.sections, function(s1,s2){
					return s1.sequence - s2.sequence;
				});
				var optionList = [];
				for(var sectionId of orderedKeys) {
					optionList.push((<option key={sectionId} value={sectionId}>{this.props.sections[sectionId]["name"]}</option>));
				}

				selectSection = (
					<div className="col-md-4" style={contentStyle}>
						<div className="col-md-8">
							<select className="form-control" onChange={this.getSectionId}>
								<option value="">Select Section</option>
								{optionList}
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
				<div className="form-group attachment_checkbox" style={{}}>
					{attachmentRows}
				</div>
			</div>
		);
	}
}

var mapStoreToProps = function(store, ownProps){
	return {
		auditStore: store.auditStores[ownProps.auditStoreId],
		sections: store.sections
	};
};

export default ReactRedux.connect(mapStoreToProps)(AttachmentUploadBox);
