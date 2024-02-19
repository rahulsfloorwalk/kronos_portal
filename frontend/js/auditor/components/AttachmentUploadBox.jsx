// import $ from "jquery";
import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
// import { orderKeys } from "../../react_utils.js";
// import { findAttachmentsByAuditStore, uploadFileForAuditStore, deleteAttachment , moveAttachmentToSection } from "../service/attachment.js";
import { findAttachmentsByAuditStore, uploadFileForAuditStore, deleteAttachment } from "../service/attachment.js";
// import { fetchproofTags, saveAttachmentTag, saveNotAvailableTag } from "../service/proof_tag.js";
import { fetchproofTags, saveAttachmentTag } from "../service/proof_tag.js";

import { Paperclip } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";

import AttachmentThumbnail from "../../components/AttachmentThumbnail.jsx";
import AttachmentInProgressThumbnail from "../../components/AttachmentInProgressThumbnail.jsx";
import AttachmentPreview from "./AttachmentPreview.jsx";

import { auditStorePropType } from "../prop_types";
// import AttachmentLegend from "../../components/AttachmentLegend.jsx";
import ProofTagLabel from "../../components/ProofTagLabel.jsx";
import "../../../css/bs_overrides.scss";

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
		attachments: [],
		uploadMessage : "",
		selectedAttachment: undefined,
		isOver: false,
		proof_tags: [],
		inProgress: {},
		progress: "",
		uploading: false,
		// sectionId:"",
		submitMessage : "",
		submitStatus: "",
		showErrors: false,
		prooftagTextareaValue: "",
		showProoftagModal: false,
		selectedProoftag: "",
		prooftagModalText: "",
		prooftagModalTagId: "",
		prooftagModalTextError: "",
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
	handleDragOver = (e) => {
		e.preventDefault();
		this.setState({ isOver: true });
	};

	handleDragLeave = () => {
		this.setState({ isOver: false });
	};

	handleDrop = (e) => {
		e.preventDefault();
		if( e.dataTransfer.files.length > 10){
			alert("You can only upload 10 attachments at once");
			return;
		}
		for( let toUploadFile of e.dataTransfer.files){
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
					isOver: false,
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
	handleClick = () => {
		this.uploadInput.click();
	};
	handleInputChange = (e) => {
		const inputElement = e.target;
		this.setState((prevState) => ({
			attachments: [...prevState.attachments, ...Array.from(inputElement.files)],
		}));
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


	handleProoftagButtonClick = () => {
		this.setState({
			showProoftagModal: true,
		});
	};

	handleProoftagModalClose = () => {
		this.setState({
			showProoftagModal: false,
		});
	};

	handleTextareaChange = (event) => {
		this.setState({
			prooftagTextareaValue: event.target.value,
			prooftagModalTextError: "",
		});
	};

	saveProoftagModalData = () => {
		// console.log("Data when Prooftag Modal:", this.state);
		if(this.state.prooftagTextareaValue && this.state.selectedProoftag){
			this.setState({
				showProoftagModal: false,
				prooftagModalText: this.state.prooftagTextareaValue,
				prooftagModalTagId : this.state.selectedProoftag,
			});
			// saveNotAvailableTag(this.state.prooftagModalTagId, this.state.selectedProoftag)
			// .then(response => {
			//     console.log("Attachment tag saved successfully:", response);
			// })
			// .catch(error => {
			//     console.error("Error saving attachment tag:", error);
			// });
		}else{
			this.setState({prooftagModalTextError:"Fields can not be empty"});
		}
	};

	handleProoftagSelect = (value) => {
		this.setState({ selectedProoftag: value });
	};
	renderProoftagModal() {
		const { prooftagTextareaValue, proof_tags, selectedProoftag } = this.state;
		const filteredProofTags = proof_tags.filter(tag => !tag.is_required);

		return (
			<div className="modal" tabIndex="-1" role="dialog" style={{ display: this.state.showProoftagModal ? "block" : "none" }}>
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">Prooftag Modal</h5>
							<button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.handleProoftagModalClose}>
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="modal-body">
							<div className="form-group">
								<label htmlFor="prooftagSelect">Select Proof Tag</label>
								<select className="form-control" id="prooftagSelect" value={selectedProoftag} onChange={(e) => this.handleProoftagSelect(e.target.value)}>
									<option value="">Select Proof Tag</option>
									{filteredProofTags.map(tag => (
										<option key={tag.id} value={tag.id}>{tag.proof_tag}</option>
									))}
								</select>
							</div>
							<div className="form-group">
								<label htmlFor="prooftagTextarea">Reason of Proof Tag not Submit</label>
								<textarea className="form-control" id="prooftagTextarea" rows="3" value={prooftagTextareaValue} onChange={this.handleTextareaChange}></textarea>
							</div>
							<div className="form-group">
								<p style={{color:"red"}}>{this.state.prooftagModalTextError}</p>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" onClick={this.handleProoftagModalClose}>Close</button>
							<button type="button" className="btn btn-primary" onClick={this.saveProoftagModalData}>Save changes</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	render() {
		// const { proof_tags } = this.state;

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
		let dragandDropBox;
		if(this.props.auditStore.status === "ACKNOWLEDGED"){
			dragandDropBox = (
				<div
					className={"drop-zone"}
					onDragOver={this.handleDragOver}
					onDragLeave={this.handleDragLeave}
					onDrop={this.handleDrop}
					onClick={this.uploadButtonClicked}
				>
					<span className="drop-zone__prompt">Drag & Drop files here </span>
					<input
						type="file"
						name="myFile"
						className="drop-zone_input"
						style={{display:"none"}}
						onChange={this.uploadFile}
						multiple
						ref={(input) => (this.inputElement = input)}
					/>
				</div>);
			deletable = true;
		}
		// let openModalButton;
		// if(this.props.auditStore.status === "ACKNOWLEDGED"){
		// 	openModalButton = <button onClick={this.handleProoftagButtonClick} type="button" className="btn btn-default">
		// 		Open Prooftag Modal
		// 	</button>;
		// }
		const attachment_tags = this.state.attachments.map((value)=> value.proof_tag);

		const proof_tag_list = [];
		for(let tag of this.state.proof_tags){
			const attach = attachment_tags.includes(tag.id);
			proof_tag_list.push(<ProofTagLabel key={tag.id} proof_tag={tag} attached={attach} is_required={true} />);
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
						<h3 style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: "1rem" }}>
							<Paperclip /> Attachments {uploadButton}
							{/* {openModalButton} */}
						</h3>
						<div style={{ clear: "both" }}></div>
						<div>{dragandDropBox}</div>
						{/* <p className="text-danger"><b>You can only add up to {this.props.auditStore.max_attachment_limit} attachments for this report.</b></p> */}
						{/* <AttachmentLegend />
						<br/> */}
						<div style={{display: "flex", justifyContent: "flex-start", alignItems: "center", gap: "1rem",flexWrap: "wrap" }}>{proof_tag_list}</div>

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
				{this.renderProoftagModal()}
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
