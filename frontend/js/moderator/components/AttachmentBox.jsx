import React from "react";
import PropTypes from "prop-types";
import $ from "jquery";

import { uploadFileForAuditStore, findAttachmentsByAuditStore, deleteAttachment, renameAttachment ,moveAttachmentToSection } from "../service/attachment.js";
import { fetchSections } from "../service/section.js"

import { Paperclip, Plus } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";

import AttachmentPreview from "../../manager/components/AttachmentPreview.jsx";

import AttachmentThumbnail from "../../components/AttachmentThumbnail.jsx";
import AttachmentInProgressThumbnail from "../../components/AttachmentInProgressThumbnail.jsx";

export default class AttachmentBox extends React.Component {
	static propTypes = {
		auditStoreId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
		auditStore: PropTypes.shape({
			status: PropTypes.string.isRequired,
		}),
	};

	state = {
		attachments: [],
		inProgress: {},
		selectedAttachment: undefined,
		sections:[],
		sectionId : "",
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
		fetchSections(this.props.auditStoreId).then((sections) => {
			this.setState({
				sections
			});
		});
	}

	attachmentSelected = (attachment) => {
		this.setState({
			selectedAttachment: attachment
		});
	};

	deleteButtonClicked = () => {
		if( this.state.selectedAttachment){
			deleteAttachment(this.state.selectedAttachment.id).then(() => {
				this.setState({
					selectedAttachment: null,
					attachments: this.state.attachments.filter((a) => a.id !== this.state.selectedAttachment.id)
				});
			});
		}
	};

	attachmentRenamed = (file_name) => {
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
					error: true,
					progress: ""
				});
			});
		}
	};
	
	getSectionId = (e) => {
		this.setState({
			sectionId : e.target.value
		});
	}
	
	moveAttachment = () => {
		let attachmentlist = []
		$('.attachment_checkbox input:checked').each(function() {
			let val = $(this).attr('value');
			attachmentlist.push(val);
		});
		
		console.log(attachmentlist);
		console.log(this.state.sectionId);
		
		moveAttachmentToSection(this.props.auditStoreId,this.state.sectionId,attachmentlist).then((response) => {
			window.location.reload();
		},(err) => {
			console.log(err.responseJSON.non_field_errors[0])
			this.setState({
				submitMessage : err.responseJSON.non_field_errors[0],
				submitStatus: "danger",
				showErrors: true,
			});
		});
		
	};
	
	
	render() {
		let submitMessageElement = <big><b className={this.state.submitStatus ? "text-" + this.state.submitStatus : ""}>{this.state.submitMessage}</b></big>;
		
		var contentStyle = {
			"paddingTop": "2%"
		};
		
		if(! this.props.auditStore){
			return <Loading/>;
		}

		var attachmentRows = [];
		for(let a of this.state.attachments){
			attachmentRows.push(<AttachmentThumbnail attachment={a} key={a.id} onSelect={() => this.attachmentSelected(a)} user="moderator"/>);
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

		let editable = this.props.auditStore.status === "SUBMITTED";
		let attachmentElement = <AttachmentPreview attachment={this.state.selectedAttachment} editable={editable}
			onRename={this.attachmentRenamed}
			onDelete={this.deleteButtonClicked}/>;

		let uploadButton;
		if(this.props.auditStore.status === "SUBMITTED"){
			attachmentRows.push(<div key="upload_input" className="hidden">
				<input type="file" onChange={this.uploadFile} multiple
					ref={(input)=>this.uploadInput = input}/>
			</div>);
			uploadButton = (<button onClick={this.uploadButtonClicked} type="button" className="btn btn-default btn-sm"><Plus/> Upload Attachment</button>);
		}

		if( attachmentRows.length === 0){
			return <Jumbotron heading="no attachments here" para="none uploaded"/>;
		} else {
			return (
				<div>
					<div className="row page-header">
						<div className="col-md-8">
							<h3><Paperclip/> Attachments {uploadButton}</h3>
							{submitMessageElement}
						</div>
						<div className="col-md-4" style={contentStyle}>
								<div className="col-md-8">
									<select className="form-control" onChange={this.getSectionId}>
										<option value="">Select Section</option>
										{this.state.sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option> )}
									</select>
								</div>
								<div className="col-md-2">
									<button className="btn btn-default btn-sm" onClick={this.moveAttachment}>Move to</button>
								</div>
						</div>
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
}
