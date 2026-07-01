import React from "react";
import PropTypes from "prop-types";
import { Paperclip } from "../../../components/Icons.jsx";
import { hashHistory } from "react-router";
import Alert from "react-s-alert";
import { findAttachmentsByAuditCycleId, findAuditCycleById, uploadFileForAuditCycle, deleteAuditCycleAttachment } from "../../service/guideline_attachment.js";
import Modal from "../../../components/Modal.jsx";
import GAttachmentThumbnail from "./GAttachmentThumbnail.jsx";
import GAttachmentInProgress from "./GAttachmentInProgress.jsx";
import GAttachmentPreview from "./GAttachmentPreview.jsx";
import "../../../../css/bs_overrides.scss";

const ATTACHMENT_LIMIT = 10;

class ReferenceAttachment extends React.Component {
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
		selectedAttachment: undefined,
		limitError: "",
	};

	componentDidMount() {
		if (this.props.params.auditCycleId) {
			findAuditCycleById(this.props.params.auditCycleId)
				.then((audit_cycle) => this.setState({ audit_cycle: { ...audit_cycle } }))
				.always(() => this.setState({ loading: false }));
		}
		this.reloadState();
	}

	reloadState = () => {
		findAttachmentsByAuditCycleId(this.props.params.auditCycleId).then((allAttachments) => {
			const attachments = allAttachments.filter((a) => a.attachment_category === "REFERENCE_ATTACHMENT");
			this.setState({ attachments });
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

	uploadFile = (file) => {
		const tempId = Math.random().toString(36).substring(7);
		this.setProgressState(tempId, { uploading: true, file });

		const promise = uploadFileForAuditCycle(this.props.params.auditCycleId, file, "REFERENCE_ATTACHMENT");

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

	handleFileInputChange = (e) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		const { attachments } = this.state;
		const remaining = ATTACHMENT_LIMIT - attachments.length;

		if (remaining <= 0) {
			const msg = `You have reached the limit of ${ATTACHMENT_LIMIT} attachments. Please delete one to upload more.`;
			Alert.warning(msg);
			this.setState({ limitError: msg });
			e.target.value = "";
			return;
		}

		const filesToUpload = Array.from(files).slice(0, remaining);

		if (files.length > remaining) {
			const msg = `Only ${remaining} slot(s) remaining. ${files.length - remaining} file(s) were skipped.`;
			Alert.warning(msg);
			this.setState({ limitError: msg });
		} else {
			this.setState({ limitError: "" });
		}

		filesToUpload.forEach((file) => this.uploadFile(file));
		e.target.value = "";
	};

	uploadButtonClicked = () => {
		const { attachments } = this.state;
		if (attachments.length >= ATTACHMENT_LIMIT) {
			const msg = `You have reached the limit of ${ATTACHMENT_LIMIT} attachments. Please delete one to upload more.`;
			Alert.warning(msg);
			this.setState({ limitError: msg });
			return;
		}
		this.uploadInput.click();
	};

	attachmentSelected = (attachment) => {
		this.setState({ selectedAttachment: attachment });
	};

	attachmentDeleteClicked = (attachment) => {
		deleteAuditCycleAttachment(attachment.id, this.props.params.auditCycleId).then(() => {
			this.setState((prev) => ({
				selectedAttachment:
					prev.selectedAttachment && prev.selectedAttachment.id === attachment.id
						? undefined
						: prev.selectedAttachment,
				limitError: "",
			}));
			this.reloadState();
		});
	};

	handleSelectedAttachment = () => {
		this.setState({ selectedAttachment: undefined });
	};

	fileInputRef = React.createRef();

	render() {
		const { attachments, inProgress, selectedAttachment, audit_cycle, limitError } = this.state;
		const hasReachedLimit = attachments.length >= ATTACHMENT_LIMIT;

		const thumbnailRows = attachments.map((a) => (
			<GAttachmentThumbnail
				key={a.id}
				attachment={a}
				deletable
				onDelete={() => this.attachmentDeleteClicked(a)}
				onSelect={() => this.attachmentSelected(a)}
				selected={a.id === (selectedAttachment && selectedAttachment.id)}
			/>
		));

		const progressRows = Object.entries(inProgress)
			.filter(([, p]) => p.uploading || p.error)
			.map(([id, p]) => (
				<GAttachmentInProgress
					key={id}
					fileName={p.file ? p.file.name : ""}
					progress={p.progress}
					uploadMessage={p.uploadMessage}
					error={p.error}
				/>
			));

		const isEmpty = thumbnailRows.length === 0 && progressRows.length === 0;

		return (
			<Modal modalTitle={"Reference Attachment"} onClose={hashHistory.goBack}>
				<div className="panel panel-default">
					<div className="ga-modal-header">
						<h4>
							Reference Attachments for <b>{audit_cycle.name}</b>
						</h4>
					</div>

					<div className="reference-attachment-body">
						<div className="reference-upload-row">
							<span className="reference-count-badge">
								Max 10 Attachments allowed	({attachments.length} / {ATTACHMENT_LIMIT})
							</span>
							<button
								type="button"
								className="btn btn-default btn-sm"
								disabled={hasReachedLimit}
								onClick={this.uploadButtonClicked}
								title={hasReachedLimit ? `Limit of ${ATTACHMENT_LIMIT} reached` : ""}
							>
								<Paperclip /> Upload
							</button>
						</div>

						<input
							type="file"
							multiple
							style={{ display: "none" }}
							ref={(input) => { this.uploadInput = input; }}
							onChange={this.handleFileInputChange}
						/>

						<div className="reference-attachment-list">
							{isEmpty ? (
								<div className="text-muted reference-empty-state">
									No attachments here
								</div>
							) : (
								<>
									{thumbnailRows}
									{progressRows}
								</>
							)}
						</div>
						{limitError && (
							<div className="reference-limit-error">
								{limitError}
							</div>
						)}
						{selectedAttachment && (
							<div className="col-md-12" style={{ paddingTop: "0.5rem" }}>
								<GAttachmentPreview
									attachment={selectedAttachment}
									section_id={0}
									handleSelectedAttachment={this.handleSelectedAttachment}
									onChange={(e) =>
										this.saveAttachmentTag &&
										this.saveAttachmentTag(selectedAttachment.id, e)
									}
								/>
							</div>
						)}
					</div>
				</div>
			</Modal>
		);
	}
}


export default ReferenceAttachment;