import React from "react";
import PropTypes from "prop-types";
import Modal from "../../components/Modal.jsx";
import AttachmentPreview from "../../manager/components/AttachmentPreview.jsx";

import AttachmentThumbnail from "../../components/AttachmentThumbnail.jsx";
import "../../../css/bs_overrides.scss";

const isPdf   = (a) => a.mime_type === "application/pdf";
const isAudio = (a) => a.mime_type && a.mime_type.startsWith("audio/");
const isVideoFile = (a) => a.mime_type && a.mime_type.startsWith("video/");
const isYoutubeLink = (a) => a.mime_type === "text/link";

export default class ViewGuideLineModal extends React.Component {
	static propTypes = {
		guideline: PropTypes.array,
		onClose: PropTypes.func.isRequired,
	};

	static defaultProps = {
		guideline: [],
	};

	state = {
		selectedAttachment: {
			pdf: undefined,
			audio: undefined,
			video: undefined,
		},
	};

	getGuidelineAttachments = () => {
		const allAttachments = this.props.guideline || [];
		return allAttachments.filter((a) => a.attachment_category === "GUIDELINE");
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

	renderSection = ({ title, section, filterFn, emptyText }) => {
		const attachments = this.getGuidelineAttachments().filter(filterFn);
		const { selectedAttachment } = this.state;

		return (
			<div className="ga-section">
				<div className="ga-section-header">
					<h5 className="ga-section-title">{title}</h5>
				</div>

				<div className="ga-attachment-list">
					{attachments.length === 0 ? (
						<div className="text-muted ga-empty-state">{emptyText}</div>
					) : (
						attachments.map((a) => (
							<AttachmentThumbnail
								key={a.id}
								attachment={a}
								proof_tags={[]}
								onSelect={() => this.attachmentSelected(a, section)}
								selected={a.id === (selectedAttachment[section] && selectedAttachment[section].id)}
							/>
						))
					)}
				</div>

				{selectedAttachment[section] && (
					<div className="clearfix" style={{ width: "100%", paddingTop: "0.5rem", overflow: "hidden" }}>
						<AttachmentPreview
							attachment={selectedAttachment[section]}
							editable={false}
							proof_tags={[]}
							onClose={() => this.handleClosePreview(section)}
						/>
					</div>
				)}
			</div>
		);
	};

	renderVideoSection = () => {
		const guidelineAttachments = this.getGuidelineAttachments();
		const videoAttachments = guidelineAttachments.filter(isVideoFile);
		const youtubeAttachment = guidelineAttachments.find(isYoutubeLink);
		const { selectedAttachment } = this.state;
		const section = "video";
		const isEmpty = videoAttachments.length === 0 && !youtubeAttachment;

		return (
			<div className="ga-section">

				{youtubeAttachment && (
					<div className="ga-youtube-row">
						<div className="ga-section-header">
							<h5 className="ga-section-title">Youtube Link</h5>
						</div>
						<div className="ga-saved-link-row">
							<a
								href={youtubeAttachment.link_url}
								target="_blank"
								rel="noopener noreferrer"
								className="ga-saved-link"
							>
								{youtubeAttachment.link_url}
							</a>
						</div>
					</div>

				)}
				<div className="ga-divider" />

				<div className="ga-section-header">
					<h5 className="ga-section-title">Video</h5>
				</div>

				<div className="ga-attachment-list">
					{isEmpty ? (
						<div className="text-muted ga-empty-state">No video attachments here</div>
					) : videoAttachments.length === 0 ? null : (
						videoAttachments.map((a) => (
							<AttachmentThumbnail
								key={a.id}
								attachment={a}
								proof_tags={[]}
								onSelect={() => this.attachmentSelected(a, section)}
								selected={a.id === (selectedAttachment[section] && selectedAttachment[section].id)}
							/>
						))
					)}
				</div>

				{selectedAttachment[section] && (
					<div className="clearfix" style={{ width: "100%", paddingTop: "0.5rem", overflow: "hidden" }}>
						<AttachmentPreview
							attachment={selectedAttachment[section]}
							editable={false}
							proof_tags={[]}
							onClose={() => this.handleClosePreview(section)}
						/>
					</div>
				)}
			</div>
		);
	};

	render() {
		return (
			<Modal modalTitle={"Guideline Attachment"} onClose={this.props.onClose}>
				<div className="panel panel-default">
					<div className="ga-sections-wrapper">
						{this.renderSection({
							title: "PDF",
							section: "pdf",
							filterFn: isPdf,
							emptyText: "No attachments here",
						})}

						<div className="ga-divider" />

						{this.renderSection({
							title: "Audio",
							section: "audio",
							filterFn: isAudio,
							emptyText: "No attachments here",
						})}

						<div className="ga-divider" />

						{this.renderVideoSection()}
					</div>
				</div>
			</Modal>
		);
	}
}