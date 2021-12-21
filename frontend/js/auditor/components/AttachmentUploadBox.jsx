// import $ from "jquery";
import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
// import { orderKeys } from "../../react_utils.js";
// import { findAttachmentsByAuditStore, uploadFileForAuditStore, deleteAttachment , moveAttachmentToSection } from "../service/attachment.js";
import { findAttachmentsByAuditStore, uploadFileForAuditStore, deleteAttachment } from "../service/attachment.js";
import { fetchproofTags, saveAttachmentTag } from "../service/proof_tag.js";

import { Paperclip, Checked, Cross } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";

import AttachmentThumbnail from "../../components/AttachmentThumbnail.jsx";
import AttachmentInProgressThumbnail from "../../components/AttachmentInProgressThumbnail.jsx";
import AttachmentPreview from "./AttachmentPreview.jsx";

import { auditStorePropType } from "../prop_types";

// import { fetchSections } from "../actions/section.js";

class AttachmentUploadBox extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		auditStoreId: PropTypes.oneOfType([ PropTypes.number, PropTypes.string, ]),
		auditStore: auditStorePropType,
		editable:PropTypes.bool,
		// sections:PropTypes.object
	};

	state = {
		uploadMessage : "",
		attachments: [],
		selectedAttachment: undefined,
		proof_tags: [],
		inProgress: {},
		progress: "",
		uploading: false,
		// sectionId:"",
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
		// this.props.dispatch(fetchSections(this.props.auditStoreId));
		fetchproofTags(this.props.auditStore.audit.audit_cycle.id).then((proof_tags) => {
			this.setState({
				proof_tags
			});
		});
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

	attachmentSelected = (attachment) => {
		this.setState({
			selectedAttachment: attachment
		});
	};

	attachmentDeleteClicked = (attachment) => {
		deleteAttachment(attachment.id).then(() => {
			this.setState({
				selectedAttachment: null,
				attachments: this.state.attachments.filter((a) => a.id !== attachment.id)
			});
		});
	};

	/*getSectionId = (e) => {
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
			this.reloadState();
			this.props.dispatch(fetchSections(this.props.auditStoreId));
			this.setState({
				selectedAttachment: null,
			});
		},(err) => {
			this.setState({
				submitMessage : err.responseJSON.non_field_errors[0],
				submitStatus: "danger",
				showErrors: true,
			});
		});
	};*/

	saveAttachmentTag = (attachmentId, e) => {
		saveAttachmentTag(attachmentId, e.target.value).then((a)=>{
			// this.setState({
			// 	selectedAttachment: a
			// });
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

	render() {
		if(! this.props.auditStore){
			return <Loading/>;
		}

		// var contentStyle = {
		// 	"paddingTop": "2%"
		// };

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

		const attachment_tags = this.state.attachments.map((value)=> value.proof_tag);

		const proof_tag_list = [];
		for(let tag of this.state.proof_tags){
			const attach = attachment_tags.includes(tag.id);
			const proof_label = attach ? <span className="label label-primary" key={tag.id} style={{ marginRight: "10px" }}><Checked /> {tag.proof_tag}</span> : <span className="label label-danger" key={tag.id} style={{ marginRight: "10px" }}><Cross /> {tag.proof_tag}</span>;
			proof_tag_list.push(proof_label);
		}

		var attachmentRows = [];

		for(let a of this.state.attachments){
			attachmentRows.push(<AttachmentThumbnail
				attachment={a} deletable={deletable} onDelete={() => this.attachmentDeleteClicked(a)} onSelect={() => this.attachmentSelected(a)} selected={a.id === (this.state.selectedAttachment && this.state.selectedAttachment.id)} key={a.id} user="" editable={this.props.editable} faulty_report_id="" proof_tags={this.state.proof_tags} section_id={0} onChange={(e) => this.saveAttachmentTag(a.id, e)}/>);
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

		let attachmentElement = <AttachmentPreview attachment={this.state.selectedAttachment} editable={this.props.editable}
			proof_tags={this.state.proof_tags}
			// onRename={this.attachmentRenamed}
			onDelete={() => this.attachmentDeleteClicked(this.state.selectedAttachment)}
			section_id={0}
			onChange={(e) => this.saveAttachmentTag(this.state.selectedAttachment.id, e)}/>;

		// var selectSection = null;
		if( attachmentRows.length === 0){
			attachmentRows.push(
				<div key="empty" className="text-muted">
						no attachments here
				</div>
			);
		}
		/*else{
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
		}*/

		return (
			<div>
				<div className="row page-header">
					<div className="col-md-8">
						<h3>
							<Paperclip/> Attachments {uploadButton}
						</h3>
						{proof_tag_list.length == 0 ? null : "Mandatory proofs "}<br/>{proof_tag_list}
						{submitMessageElement}
					</div>
					{/* {selectSection} */}
				</div>
				{/* <div className="form-group attachment_checkbox" style={{}}>
					{attachmentRows}
				</div> */}
				<div className="row">
					<div className="col-md-12 attachment_checkbox" style={{maxHeight:"500px", overflowY: "auto"}}>
						{attachmentRows}
					</div>
					<div className="col-md-12">
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
		// sections: store.sections
	};
};

export default ReactRedux.connect(mapStoreToProps)(AttachmentUploadBox);
