// import React from "react";
// import PropTypes from "prop-types";
// import { Paperclip,Cross } from "../../../components/Icons.jsx";
// import { hashHistory } from "react-router";
// import Alert from "react-s-alert";
// import {findAttachmentsByAuditCycleId,findAuditCycleById,uploadFileForAuditCycle,deleteAuditCycleAttachment} from "../../service/guideline_attachment.js";
// import Modal from "../../../components/Modal.jsx";
// import GAttachmentThumbnail from "./GAttachmentThumbnail.jsx";
// import GAttachmentInProgress from "./GAttachmentInProgress.jsx";
// import GAttachmentPreview from "./GAttachmentPreview.jsx";
// import {Link} from "react-router";

// class GuidelineAttachment extends React.Component{
// 	static propTypes = {
// 		params: PropTypes.shape({
// 			auditCycleId: PropTypes.string.isRequired,
// 		}).isRequired,
// 		children : PropTypes.node,
// 	};
// 	state={
// 		uploadMessage:"",
// 		attachments:[],
// 		inProgress:{},
// 		expanded: false,
// 		uploading:false,
// 		selectedAttachment: undefined,
// 		loading:false,
// 		audit_cycle:{},
// 	};

// 	toggleExpand = () => {
// 		this.setState({ expanded: !this.state.expanded });
// 	};
// 	reloadState = () => {
// 		findAttachmentsByAuditCycleId(this.props.params.auditCycleId).then((attachments) => {
// 			this.setState({
// 				attachments
// 			});
// 		});
// 	};
// 	componentDidMount() {
// 		if (this.props.params.auditCycleId) {
// 			findAuditCycleById(this.props.params.auditCycleId).then((audit_cycle) => {
// 				this.setState({
// 					audit_cycle: Object.assign({}, audit_cycle)
// 				});
// 			}).always(() => this.setLoading(false));
// 		}
// 		this.reloadState();
// 	}

// 	uploadButtonClicked = () => {
// 		if (this.state.attachments.length > 0) {
// 			Alert.warning("You must delete the previously uploaded image before uploading a new one");
// 			return;
// 		}
// 		this.uploadInput.click();
// 	};
// 	setProgressState = (tempId, progressState) => {
// 		this.setState((prevState) => {
// 			return Object.assign({}, prevState, {
// 				inProgress: Object.assign({}, prevState.inProgress, {
// 					[tempId]: Object.assign({}, prevState.inProgress[tempId], progressState)
// 				})
// 			});
// 		});
// 	};

// 	uploadFile = () => {
// 		if (this.uploadInput.files.length > 10) {
// 			alert("You can only upload 10 attachments at once");
// 			return;
// 		}
// 		for (let toUploadFile of this.uploadInput.files) {
// 			let tempId = Math.random().toString(36).substring(7);
// 			this.setProgressState(tempId, {
// 				uploading: true,
// 				file: toUploadFile
// 			});
// 			var promise = uploadFileForAuditCycle(this.props.params.auditCycleId, toUploadFile);
// 			promise.progress((type, percent) => {
// 				if (type === "INIT") {
// 					this.setProgressState(tempId, {
// 						uploadMessage: "initializing upload",
// 						active: false,
// 					});
// 				}
// 				if (type === "STARTING_UPLOAD") {
// 					this.setProgressState(tempId, {
// 						uploadMessage: "starting upload",
// 						active: true,
// 					});
// 				}
// 				if (type === "UPLOAD_PROGRESS") {
// 					this.setProgressState(tempId, {
// 						uploadMessage: "",
// 						progress: Math.floor(percent)
// 					});
// 				}
// 			});
// 			promise.always(() => {
// 				this.setProgressState(tempId, {
// 					progress: "",
// 					uploading: false,
// 					active: false
// 				});
// 			});
// 			promise.then(() => {
// 				this.setProgressState(tempId, {
// 					uploadMessage: "upload successful",
// 				});
// 				this.reloadState();
// 			}, (errorMessage) => {
// 				this.setProgressState(tempId, {
// 					uploadMessage: errorMessage,
// 					error: true,
// 				});
// 			});
// 		}
// 	};

// 	attachmentSelected = (attachment) => {
// 		this.setState({
// 			selectedAttachment: attachment
// 		});
// 	};

// 	attachmentDeleteClicked = (attachment) => {
// 		deleteAuditCycleAttachment(attachment.id, this.props.params.auditCycleId).then(() => {
// 			this.reloadState();
// 		});
// 	};
// 	handleSelectedAttachment = ()=>{
// 		this.setState({
// 			selectedAttachment: null,
// 		});
// 	};

// 	render(){
// 		let uploadButton = (<button onClick={this.uploadButtonClicked} type="button" className="btn btn-default pull-right"><Paperclip /> Upload</button>);
// 		let deletable = true;
// 		var attachmentRows = [];

// 		for (let a of this.state.attachments) {
// 			attachmentRows.push(<GAttachmentThumbnail
// 				attachment={a}
// 				deletable={deletable}
// 				onDelete={() => this.attachmentDeleteClicked(a)}
// 				onSelect={() => this.attachmentSelected(a)}
// 				selected={a.id === (this.state.selectedAttachment && this.state.selectedAttachment.id)}
// 				key={a.id}
// 			/>);
// 		}

// 		for (let id in this.state.inProgress) {
// 			if (this.state.inProgress[id].uploading || this.state.inProgress[id].error) {
// 				let fileName = this.state.inProgress[id].file ? this.state.inProgress[id].file.name : "";
// 				attachmentRows.push(<GAttachmentInProgress
// 					key={id}
// 					fileName={fileName}
// 					progress={this.state.inProgress[id].progress}
// 					uploadMessage={this.state.inProgress[id].uploadMessage}
// 					error={this.state.inProgress[id].error}
// 				/>);
// 			}
// 		}
// 		if (attachmentRows.length === 0) {
// 			attachmentRows.push(
// 				<div key="empty" className="text-muted" style={{ padding: "2rem 4rem", fontSize: "2rem", }}>
// 				No Attachments here
// 				</div>
// 			);
// 		}

// 		let attachmentElement = <GAttachmentPreview attachment={this.state.selectedAttachment}
// 			section_id={0}
// 			handleSelectedAttachment = {this.handleSelectedAttachment}
// 			onChange={(e) => this.saveAttachmentTag(this.state.selectedAttachment.id, e)}
// 		/>;

// 		let panelClass = this.state.attachments.length > 0 ? "panel-success-hoverable" : "panel-default";
// 		let toShow = this.state.expanded || this.state.attachments.length === 0;
// 		return (
// 			<Modal modalTitle={"Guideline Attachment"} onClose={hashHistory.goBack}>
// 				<div className={"panel " + panelClass}>
// 					<div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem" }}>
// 						<Link to={`audit_cycle/${this.props.params.auditCycleId}/questionnaire`}> <Cross /></Link>
// 					</div>
// 					<div className="panel-heading" style={{ cursor: "pointer" }} onClick={this.toggleExpand}>
// 						<input type="file"
// 							onChange={this.uploadFile}
// 							disabled={this.state.uploading}
// 							ref={(input) => this.uploadInput = input}
// 							style={{ "display": "none" }} />
// 						{uploadButton}
// 						<h4>
// 						Attachment for <b>{this.state.audit_cycle.name}</b><span className="text-danger" style={{ marginLeft: ".5rem" }}><b>*</b></span>
// 						</h4>
// 					</div>
// 					{toShow ?
// 						<div className="row">
// 							<div className="list-group" style={{ "height": "150px", "overflowY": "auto", padding: "2rem" }}>
// 								{attachmentRows}
// 							</div>
// 							<div className="col-md-12">
// 								{attachmentElement}
// 							</div>
// 						</div>
// 						: null}
// 				</div>
// 			</Modal>
// 		);
// 	}
// }
// export default GuidelineAttachment;


import React from "react";
import PropTypes from "prop-types";
import { Paperclip } from "../../../components/Icons.jsx";
import { hashHistory } from "react-router";
import Alert from "react-s-alert";
import {
	findAttachmentsByAuditCycleId,
	findAuditCycleById,
	uploadFileForAuditCycle,
	deleteAuditCycleAttachment,
	saveYoutubeLinkForAuditCycle,
} from "../../service/guideline_attachment.js";
import Modal from "../../../components/Modal.jsx";
import GAttachmentThumbnail from "./GAttachmentThumbnail.jsx";
import GAttachmentInProgress from "./GAttachmentInProgress.jsx";
import GAttachmentPreview from "./GAttachmentPreview.jsx";
import "../../../../css/bs_overrides.scss";

const isPdf   = (a) => a.mime_type === "application/pdf";
const isAudio = (a) => a.mime_type && a.mime_type.startsWith("audio/");
const isVideo = (a) => a.mime_type && (a.mime_type.startsWith("video/") || a.mime_type === "text/link");

const SECTION_LIMIT = 1;

class GuidelineAttachment extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}).isRequired,
		children: PropTypes.node,
	};

	state = {
		attachments: [],
		inProgress: {},
		audit_cycle: {},
		loading: false,
		selectedAttachment: {
			pdf: undefined,
			audio: undefined,
			video: undefined,
		},
		youtubeLinkInput: "",
		savedYoutubeLink: "",
		youtubeLinkSaving: false,
		uploadError: {
			pdf: "",
			audio: "",
			video: "",
		},
	};

	componentDidMount() {
		const { auditCycleId } = this.props.params;
		if (auditCycleId) {
			findAuditCycleById(auditCycleId)
				.then((audit_cycle) => this.setState({ audit_cycle: { ...audit_cycle } }))
				.always(() => this.setState({ loading: false }));
		}
		this.reloadState();
	}

	reloadState = () => {
		findAttachmentsByAuditCycleId(this.props.params.auditCycleId).then((allAttachments) => {
			const attachments = allAttachments.filter((a) => a.attachment_category === "GUIDELINE");
			const youtubeAttachment = attachments.find((a) => a.mime_type === "text/link");
			this.setState({
				attachments,
				savedYoutubeLink: youtubeAttachment ? youtubeAttachment.link_url : "",
				youtubeLinkInput: youtubeAttachment ? youtubeAttachment.link_url : "",
			});
		});
	};

	setProgressState = (tempId, progressState) => {
		this.setState((prevState) => ({
			inProgress: {
				...prevState.inProgress,
				[tempId]: {
					...prevState.inProgress[tempId],
					...progressState,
				},
			},
		}));
	};

	uploadFile = (file, section) => {
		const tempId = Math.random().toString(36).substring(7);
		this.setProgressState(tempId, { uploading: true, file, section });

		const promise = uploadFileForAuditCycle(this.props.params.auditCycleId, file, "GUIDELINE");

		promise.progress((type, percent) => {
			if (type === "INIT") {
				this.setProgressState(tempId, { uploadMessage: "initialising upload", active: false });
			}
			if (type === "STARTING_UPLOAD") {
				this.setProgressState(tempId, { uploadMessage: "starting upload", active: true });
			}
			if (type === "UPLOAD_PROGRESS") {
				this.setProgressState(tempId, { uploadMessage: "", progress: Math.floor(percent) });
			}
		});

		promise.always(() => {
			this.setProgressState(tempId, { progress: "", uploading: false, active: false });
		});

		promise.then(
			() => {
				this.setProgressState(tempId, { uploadMessage: "upload successful" });
				this.reloadState();
			},
			(errorMessage) => {
				this.setProgressState(tempId, { uploadMessage: errorMessage, error: true });
			}
		);
	};

	handleFileInputChange = (section) => (e) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;
		const file = files[0];
		const validations = {
			pdf:   (f) => f.type === "application/pdf",
			audio: (f) => f.type.startsWith("audio/"),
			video: (f) => f.type.startsWith("video/"),
		};
		if (!validations[section](file)) {
			const labels = { pdf: "PDF", audio: "audio", video: "video" };
			const msg = `Only ${labels[section]} files are allowed in this section.`;
			Alert.warning(msg);
			this.setState((prev) => ({
				uploadError: { ...prev.uploadError, [section]: msg },
			}));
			e.target.value = "";
			return;
		}
		this.setState((prev) => ({
			uploadError: { ...prev.uploadError, [section]: "" },
		}));
		this.uploadFile(files[0], section);
		e.target.value = "";
	};

	attachmentDeleteClicked = (attachment, section) => {
		deleteAuditCycleAttachment(attachment.id, this.props.params.auditCycleId).then(() => {
			this.setState((prev) => ({
				selectedAttachment: {
					...prev.selectedAttachment,
					[section]:
						prev.selectedAttachment[section] && prev.selectedAttachment[section].id === attachment.id
							? undefined
							: prev.selectedAttachment[section],
				},
			}));
			this.reloadState();
		});
	};

	attachmentSelected = (attachment, section) => {
		this.setState((prev) => ({
			selectedAttachment: {
				...prev.selectedAttachment,
				[section]: attachment,
			},
		}));
	};

	handleClosePreview = (section) => {
		this.setState((prev) => ({
			selectedAttachment: {
				...prev.selectedAttachment,
				[section]: undefined,
			},
		}));
	};

	handleYoutubeLinkChange = (e) => {
		this.setState({ youtubeLinkInput: e.target.value });
	};

	handleYoutubeLinkSave = () => {
		const { youtubeLinkInput } = this.state;
		if (!youtubeLinkInput.trim()) {
			Alert.warning("Please enter a YouTube link before saving.");
			return;
		}
		this.setState({ youtubeLinkSaving: true });
		saveYoutubeLinkForAuditCycle(this.props.params.auditCycleId, youtubeLinkInput.trim(), "GUIDELINE")
			.then(() => {
				this.setState({ savedYoutubeLink: youtubeLinkInput.trim(), youtubeLinkSaving: false });
				Alert.success("YouTube link saved successfully.");
				this.reloadState(); // refresh so the link shows in the list
			})
			.fail((err) => {
				const msg = err && err.responseJSON && err.responseJSON.non_field_errors
					? err.responseJSON.non_field_errors[0]
					: "Failed to save YouTube link. Please try again.";
				Alert.error(msg);
				this.setState({ youtubeLinkSaving: false });
			});
	};

	handleYoutubeLinkClear = () => {
		const youtubeAttachment = this.state.attachments.find((a) => a.mime_type === "text/link");
		if (!youtubeAttachment) {
			this.setState({ savedYoutubeLink: "", youtubeLinkInput: "" });
			return;
		}
		deleteAuditCycleAttachment(youtubeAttachment.id, this.props.params.auditCycleId)
			.then(() => {
				this.setState({ savedYoutubeLink: "", youtubeLinkInput: "" });
				this.reloadState();
				Alert.success("YouTube link removed successfully.");
			})
			.fail(() => {
				Alert.error("Failed to remove YouTube link. Please try again.");
			});
	};

	pdfInputRef   = React.createRef();
	audioInputRef = React.createRef();
	videoInputRef = React.createRef();

	renderSection = ({ title, section, filterFn, accept, inputRef }) => {
		const { attachments, inProgress, selectedAttachment } = this.state;

		const sectionAttachments = attachments.filter(filterFn);
		const hasReachedLimit = sectionAttachments.filter((a) => a.mime_type !== "text/link").length >= SECTION_LIMIT;

		const progressRows = Object.entries(inProgress)
			.filter(([, p]) => p.section === section && (p.uploading || p.error))
			.map(([id, p]) => (
				<GAttachmentInProgress
					key={id}
					fileName={p.file ? p.file.name : ""}
					progress={p.progress}
					uploadMessage={p.uploadMessage}
					error={p.error}
				/>
			));
		const thumbnailRows = sectionAttachments.filter((a) => a.mime_type !== "text/link").map((a) => (
			<GAttachmentThumbnail
				key={a.id}
				attachment={a}
				deletable
				onDelete={() => this.attachmentDeleteClicked(a, section)}
				onSelect={() => this.attachmentSelected(a, section)}
				selected={a.id === (selectedAttachment[section] && selectedAttachment[section].id)}
			/>
		));

		const uploadedVideoRows = sectionAttachments.filter((a) => a.mime_type !== "text/link");
		const isEmpty = uploadedVideoRows.length === 0 && progressRows.length === 0;

		return (
			<div className="ga-section">
				<div className="ga-section-header">
					<h5 className="ga-section-title">{title}</h5>
					<button
						type="button"
						className="btn btn-default btn-sm"
						disabled={hasReachedLimit}
						onClick={() => !hasReachedLimit && inputRef.current.click()}
						title={hasReachedLimit ? "Delete the existing attachment to upload a new one" : ""}
					>
						<Paperclip /> Upload
					</button>
				</div>

				<input
					type="file"
					accept={accept}
					style={{ display: "none" }}
					ref={inputRef}
					onChange={this.handleFileInputChange(section)}
				/>

				<div className="ga-attachment-list">
					{isEmpty ? (
						<div className="text-muted ga-empty-state">
							No attachments here
						</div>
					) : (
						<>
							{thumbnailRows}
							{progressRows}
						</>
					)}
				</div>
				{this.state.uploadError[section] && (
					<div className="ga-upload-error">
						{this.state.uploadError[section]}
					</div>
				)}
				{selectedAttachment[section] && (
					<div className="clearfix" style={{ width: "100%", paddingTop: "0.5rem", overflow: "hidden" }}>
						<GAttachmentPreview
							attachment={selectedAttachment[section]}
							section_id={0}
							handleSelectedAttachment={() => this.handleClosePreview(section)}
							onChange={(e) =>
								this.saveAttachmentTag &&
								this.saveAttachmentTag(selectedAttachment[section].id, e)
							}
						/>
					</div>
				)}
			</div>
		);
	};

	renderVideoSection = () => {
		const {
			attachments,
			inProgress,
			selectedAttachment,
			youtubeLinkInput,
			savedYoutubeLink,
			youtubeLinkSaving,
		} = this.state;

		const section = "video";
		const sectionAttachments = attachments.filter(isVideo);
		const uploadedVideoRows = sectionAttachments.filter((a) => a.mime_type !== "text/link");
		const hasReachedLimit = uploadedVideoRows.length >= SECTION_LIMIT;

		const progressRows = Object.entries(inProgress)
			.filter(([, p]) => p.section === section && (p.uploading || p.error))
			.map(([id, p]) => (
				<GAttachmentInProgress
					key={id}
					fileName={p.file ? p.file.name : ""}
					progress={p.progress}
					uploadMessage={p.uploadMessage}
					error={p.error}
				/>
			));

		const thumbnailRows = uploadedVideoRows.map((a) => (
			<GAttachmentThumbnail
				key={a.id}
				attachment={a}
				deletable
				onDelete={() => this.attachmentDeleteClicked(a, section)}
				onSelect={() => this.attachmentSelected(a, section)}
				selected={a.id === (selectedAttachment[section] && selectedAttachment[section].id)}
			/>
		));

		const isEmpty = uploadedVideoRows.length === 0 && progressRows.length === 0;
		return (
			<div className="ga-section">
				<div className="ga-youtube-row">
					<h5 className="ga-section-title">Youtube Link</h5>
					{savedYoutubeLink ? (
						<div className="ga-saved-link-row">
							<a
								href={savedYoutubeLink}
								target="_blank"
								rel="noopener noreferrer"
								className="ga-saved-link"
							>
								{savedYoutubeLink}
							</a>
							<button
								type="button"
								className="btn btn-danger btn-xs"
								onClick={this.handleYoutubeLinkClear}
								style={{ marginLeft: "0.75rem" }}
							>
								Remove
							</button>
						</div>
					) : (
						<div className="ga-youtube-input-row">
							<input
								type="url"
								className="form-control input-sm ga-youtube-input"
								placeholder="https://www.youtube.com/watch?v=..."
								value={youtubeLinkInput}
								onChange={this.handleYoutubeLinkChange}
							/>
							<button
								type="button"
								className="btn btn-primary btn-sm"
								onClick={this.handleYoutubeLinkSave}
								disabled={youtubeLinkSaving}
								style={{ marginLeft: "0.5rem", whiteSpace: "nowrap" }}
							>
								{youtubeLinkSaving ? "Saving…" : "Save Link"}
							</button>
						</div>
					)}

				</div>
				<div className="ga-divider" />

				<div className="ga-section-header">
					<h5 className="ga-section-title">Video</h5>
					<button
						type="button"
						className="btn btn-default btn-sm"
						disabled={hasReachedLimit}
						onClick={() => !hasReachedLimit && this.videoInputRef.current.click()}
						title={hasReachedLimit ? "Delete the existing video to upload a new one" : ""}
					>
						<Paperclip /> Upload Video
					</button>
				</div>

				<input
					type="file"
					accept="video/*"
					style={{ display: "none" }}
					ref={this.videoInputRef}
					onChange={this.handleFileInputChange(section)}
				/>

				<div className="ga-attachment-list">
					{isEmpty ? (
						<div className="text-muted ga-empty-state">
							No video attachments here
						</div>
					) : (
						<>
							{thumbnailRows}
							{progressRows}
						</>
					)}
				</div>
				{this.state.uploadError["video"] && (
					<div className="ga-upload-error">
						{this.state.uploadError["video"]}
					</div>
				)}
				{selectedAttachment[section] && (
					<div className="clearfix" style={{ width: "100%", paddingTop: "0.5rem", overflow: "hidden" }}>
						<GAttachmentPreview
							attachment={selectedAttachment[section]}
							section_id={0}
							handleSelectedAttachment={() => this.handleClosePreview(section)}
						/>
					</div>
				)}
			</div>
		);
	};
	render() {
		const { audit_cycle } = this.state;
		const cycleName = audit_cycle.name || "";

		return (
			<Modal modalTitle={"Guideline Attachment"} onClose={hashHistory.goBack}>
				<div className="panel panel-default">
					<div className="ga-modal-header">
						<h4>
							Guideline Attachments for <b>{cycleName}</b>
						</h4>
					</div>

					<div className="ga-sections-wrapper ">
						{this.renderSection({
							title:    "PDF",
							section:  "pdf",
							filterFn: isPdf,
							accept:   "application/pdf",
							inputRef: this.pdfInputRef,
						})}

						<div className="ga-divider" />

						{this.renderSection({
							title:    "Audio",
							section:  "audio",
							filterFn: isAudio,
							accept:   "audio/*",
							inputRef: this.audioInputRef,
						})}

						<div className="ga-divider" />

						{this.renderVideoSection()}
					</div>
				</div>
			</Modal>
		);
	}
}


export default GuidelineAttachment;