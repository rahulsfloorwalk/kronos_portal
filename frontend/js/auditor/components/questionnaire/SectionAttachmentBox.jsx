// import $ from "jquery";
import React from "react";
import PropTypes from "prop-types";
import { } from "react-router";

import { Paperclip, Checked, Cross } from "../../../components/Icons.jsx";
// import { orderKeys } from "../../../react_utils.js";

import AttachmentThumbnail from "../../../components/AttachmentThumbnail.jsx";
import AttachmentInProgressThumbnail from "../../../components/AttachmentInProgressThumbnail.jsx";
import AttachmentPreview from "../../components/AttachmentPreview.jsx";

// import { findAttachmentsByAuditStoreAndSection, uploadFileForReportSection, deleteAttachment, moveAttachmentToSection } from "../../../auditor/service/attachment.js";
import { findAttachmentsByAuditStoreAndSection, uploadFileForReportSection, deleteAttachment } from "../../../auditor/service/attachment.js";
import { saveAttachmentTag } from "../../service/proof_tag.js";

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

		editable:PropTypes.bool,
		// sections:PropTypes.object,
		proof_tags: PropTypes.array
	};

	constructor(props){
		super(props);
		this.state = {
			attachments: [],
			selectedAttachment: undefined,
			inProgress: {},
			// attachmentSectionId: "",
			submitMessage: "",
			submitStatus: "",
			showErrors: false,
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

	attachmentSelected = (attachment) => {
		this.setState({
			selectedAttachment: attachment
		});
		/*if (this.state.selectedAttachment){
			if(this.state.selectedAttachment.id === attachment.id){
				this.setState({
					selectedAttachment: null
				});
			}
			else{
				this.setState({
					selectedAttachment: attachment
				});
			}
		}
		else{
			this.setState({
				selectedAttachment: attachment
			});
		}*/
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

	/*getAttachmentSectionId = (e) => {
		this.setState({
			attachmentSectionId : e.target.value
		});
	};

	moveAttachmentSection = () => {
		let attachmentlist = [];
		$(`.attachment_checkbox_section${this.props.sectionId} input:checked`).each(function() {
			let val = $(this).attr("value");
			attachmentlist.push(val);
		});

		moveAttachmentToSection(this.props.auditStoreId,this.state.attachmentSectionId,attachmentlist).then(() => {
			window.location.reload();
		},(err) => {
			this.setState({
				submitMessage : err.responseJSON.non_field_errors[0],
				submitStatus: "danger",
				showErrors: true,
			});
		});
	};*/

	saveAttachmentTag = (attachmentId, e) => {
		saveAttachmentTag(attachmentId, e.target.value).then(()=>{
			this.reloadAttachments(this.props.auditStoreId, this.props.sectionId);
		});
	};

	render(){
		let uploadButton;
		if(this.props.auditStore && this.props.auditStore.status === "ACKNOWLEDGED"){
			uploadButton = (<button onClick={this.uploadButtonClicked} type="button" className="btn btn-default btn-sm" style={{
			}}><Paperclip/> Upload</button>);
		}

		let attachmentRows = [];
		let deletable = this.props.auditStore && this.props.auditStore.status === "ACKNOWLEDGED";
		let selectedAttachmentId = null;
		if (this.state.selectedAttachment){
			selectedAttachmentId = this.state.selectedAttachment.id;
		}
		let selectedAttachment = this.state.attachments.filter( a => a.id === selectedAttachmentId)[0];
		for(let a of this.state.attachments){
			attachmentRows.push(<AttachmentThumbnail
				key={a.id}
				attachment={a}
				deletable={deletable}
				onDelete={() => this.attachmentDeleteClicked(a)}
				onSelect={() => this.attachmentSelected(a)}
				selected={a.id === selectedAttachmentId}
				user="auditor"
				editable = {this.props.editable}
				faulty_report_id=""
				proof_tags= {this.props.proof_tags}
				section_id= {this.props.sectionId}
				onChange= {(e) => this.saveAttachmentTag(a.id, e)}
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

		let submitMessageElement = <big><b className={this.state.submitStatus ? "text-" + this.state.submitStatus : ""}>{this.state.submitMessage}</b></big>;

		// let sectionSelect = null;
		if( attachmentRows.length === 0){
			attachmentRows.push(<span key="empty" className="text-muted">no attachments here&nbsp;</span>);
			// sectionSelect = null;
		}
		/*else{
			if(this.props.editable){
				var orderedKeys = orderKeys(this.props.sections, function(s1,s2){
					return s1.sequence - s2.sequence;
				});
				var optionList = [];
				for(var sectionId of orderedKeys) {
					if(this.props.sectionId == sectionId){
						null;
					}
					else{
						optionList.push((<option key={sectionId} value={sectionId}>{this.props.sections[sectionId]["name"]}</option>));
					}
				}

				sectionSelect = (
					<div className="col-md-4">
						<div className="col-md-8">
							<select className="form-control" onChange={this.getAttachmentSectionId}>
								<option value="">Select Section</option>
								<option key="0" value="0">Main Section</option>
								{optionList}
							</select>
						</div>
						<div className="col-md-2">
							<button className="btn btn-default btn-sm" onClick={this.moveAttachmentSection}>Move to</button>
						</div>
					</div>
				);

			}
		}*/
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
		let borderStyle = {
			borderTop: "1px solid #eee"
		};
		const setion_proof_tags = this.props.proof_tags.filter((val) => val.section_id == this.props.sectionId);
		const attachment_tags = this.state.attachments.map((value)=> value.proof_tag);

		const proof_tag_list = [];
		for(let tag of setion_proof_tags){
			const attach = attachment_tags.includes(tag.id);
			const proof_label = attach ? <span className="label label-primary" key={tag.id} style={{ marginRight: "10px" }}><Checked /> {tag.proof_tag}</span> : <span className="label label-danger" style={{ marginRight: "10px" }} key={tag.id}><Cross /> {tag.proof_tag}</span>;
			proof_tag_list.push(proof_label);
		}

		return (
			<div style={borderStyle}>
				<div className="panel-body" style={panelStyle}>
					<div className="col-md-12">
						<h4>Attachments {uploadButton} {minimumAttachmentCount}</h4>
						<p>{proof_tag_list.length == 0 ? null : "Mandatory proofs: "} <br/>{proof_tag_list}</p>
						{submitMessageElement}
					</div>
					{/* {sectionSelect} */}
				</div>
				<div className={`panel-body attachment_checkbox_section${this.props.sectionId}`} style={panelStyle}>
					<div style={{maxHeight:"500px", overflowY: "auto"}}>
						{attachmentRows}
						<input type="file" multiple
							onChange={this.uploadFile}
							disabled={this.state.uploading}
							ref={(input)=>this.uploadInput = input}
							style={{"display":"none"}}/>
					</div>
					<AttachmentPreview attachment={selectedAttachment} editable={this.props.editable}
						deletable={deletable}
						proof_tags={this.props.proof_tags}
						// onRename={this.selectedAttachmentRenamed}
						onDelete={() => this.attachmentDeleteClicked(selectedAttachment)}
						section_id={this.props.sectionId}
						onChange= {(e) => this.saveAttachmentTag(selectedAttachment.id, e)}/>
				</div>
			</div>
		);
	}
}
