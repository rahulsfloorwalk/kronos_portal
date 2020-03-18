import $ from "jquery";
import React, { Component } from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";

import Alert from "react-s-alert";

import { orderKeys } from "../../react_utils.js";

import { uploadFileForAuditStore, findAttachmentsByAuditStore, deleteAttachment, renameAttachment, moveAttachmentToSection } from "../service/attachment.js";
import { Paperclip, Plus } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";

import AttachmentPreview from "./AttachmentPreview.jsx";

import AttachmentThumbnail from "../../components/AttachmentThumbnail.jsx";
import AttachmentInProgressThumbnail from "../../components/AttachmentInProgressThumbnail.jsx";

import { auditStorePropType } from "../prop_types";
import { fetchSections } from "../actions/section.js";

export class AttachmentDisplayBox extends Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		auditStoreId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
		auditStore: auditStorePropType,
		sections: PropTypes.object,
	};

	constructor(props){
		super(props);
		this.state = {
			attachments: [],
			inProgress: {},
			selectedAttachment: undefined,
			sectionId: "",
			submitMessage : "",
			submitStatus: "",
			showErrors: false,
		};
	}
	reloadState = () => {
		findAttachmentsByAuditStore(this.props.auditStoreId).then((attachments) => {
			this.setState({
				attachments
			});
		});
	};
	componentDidMount(){
		this.reloadState();
		this.props.dispatch(fetchSections(this.props.auditStoreId));
	}
	attachmentSelected = (attachment) => {
		this.setState({
			selectedAttachment: attachment
		});
	};
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
	};
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
	};
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

	render(){
		if(! this.props.auditStore){
			return <Loading/>;
		}
		let editable = this.props.auditStore.status === "SUBMITTED" || this.props.auditStore.status === "PM_REVIEW";
		
		let submitMessageElement = <big><b className={this.state.submitStatus ? "text-" + this.state.submitStatus : ""}>{this.state.submitMessage}</b></big>;

		var contentStyle = {
			"paddingTop": "2%"
		};

		var attachmentRows = [];

		for(let a of this.state.attachments){
			attachmentRows.push(<AttachmentThumbnail attachment={a} key={a.id} onSelect={() => this.attachmentSelected(a)} deletable={false} selected={a.id === (this.state.selectedAttachment && this.state.selectedAttachment.id)} user="manager" editable={editable} faulty_report_id={a.faulty_report_id}/>);
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

		let attachmentElement = <AttachmentPreview attachment={this.state.selectedAttachment} editable={editable}
			onRename={this.attachmentRenamed}
			onDelete={this.deleteButtonClicked}/>;

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

		var selectSection = null;
		if( attachmentRows.length === 0){
			attachmentRows.push(<Jumbotron key="empty" heading="no attachments here" para="none uploaded"/>);
		}
		else{
			if(editable){
				var orderedKeys = orderKeys(this.props.sections, function(s1,s2){
					return s1.sequence - s2.sequence;
				});
				var optionList = [];
				for(var sectionId of orderedKeys) {
						optionList.push((<option key={sectionId} value={sectionId}>{this.props.sections[sectionId]['name']}</option>));
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
						<h3><Paperclip/> Attachments {uploadButton}</h3>
						{submitMessageElement}
					</div>
					{selectSection}
				</div>
				<div className="row">
					<div className="col-md-4 attachment_checkbox" style={{maxHeight:"500px", overflowY: "auto"}}>
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
		sections:store.sections
	};
};

export default ReactRedux.connect(mapStoreToProps)(AttachmentDisplayBox);
