import React, { Component } from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { rotateImageAngle } from "../service/attachment.js";
import { Paperclip } from "../../components/Icons.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";

import AttachmentPreview from "./AttachmentPreview.jsx";

import AttachmentThumbnail from "../../components/AttachmentThumbnail.jsx";
import AttachmentInProgressThumbnail from "../../components/AttachmentInProgressThumbnail.jsx";

import { auditStorePropType } from "../prop_types.js";
import { findAttachmentsByAuditCycleId } from "../service/guideline_attachment.js";

export class ReferenceAttachmentBox extends Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		auditStoreId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
		auditStore: auditStorePropType,
		// sections: PropTypes.object,
	};

	constructor(props) {
		super(props);
		this.state = {
			attachments: [],
			inProgress: {},
			proof_tags: [],
			selectedAttachment: undefined,
			submitMessage: "",
			submitStatus: "",
			showErrors: false,
			disableRotateButton: false,
		};
	}


	reloadState = () => {
		findAttachmentsByAuditCycleId(this.props.auditStore.audit.audit_cycle.id).then((allAttachments) => {
			const attachments = allAttachments.filter((a) => a.attachment_category === "REFERENCE_ATTACHMENT");
			this.setState({ attachments });
		});
	};
	componentDidMount() {
		this.reloadState();
	}
	attachmentSelected = (attachment) => {
		this.setState({
			selectedAttachment: attachment
		});
	};


	rotateImage = (angle) => {
		this.setState({ disableRotateButton: true });
		rotateImageAngle(this.state.selectedAttachment.id, angle).then((a) => {
			this.setState({
				selectedAttachment: a
			});
			for (let i in this.state.attachments) {
				if (this.state.attachments[i].id === a.id) {
					let arr = this.state.attachments;
					arr[i] = a;
					this.setState({
						attachments: arr
					});
				}
			}
			this.setState({ disableRotateButton: false });
		});
	};

	render() {
		const editable = false;

		var attachmentRows = [];

		for (let a of this.state.attachments) {
			attachmentRows.push(<AttachmentThumbnail attachment={a} key={a.id} onSelect={() => this.attachmentSelected(a)} onDelete={this.deleteButtonClicked} selected={a.id === (this.state.selectedAttachment && this.state.selectedAttachment.id)} user="manager" editable={editable} deletable={editable} faulty_report_id={a.faulty_report_id} proof_tags={this.state.proof_tags} section_id={0} onChange={(e) => this.saveAttachmentTag(a.id, e)} />);
		}
		for (let id in this.state.inProgress) {
			if (this.state.inProgress[id].uploading || this.state.inProgress[id].error) {
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
			proof_tags={this.state.proof_tags}
			onRename={this.attachmentRenamed}
			onDelete={this.deleteButtonClicked}
			onChange={(e) => this.saveAttachmentTag(this.state.selectedAttachment.id, e)}
			rotateImage={this.rotateImage}
			section_id={0}
			disableRotateButton={this.state.disableRotateButton}
			onClose={() => this.setState({ selectedAttachment: undefined })}
		/>;



		if (attachmentRows.length === 0) {
			attachmentRows.push(<Jumbotron key="empty" heading="no attachments here" para="none uploaded" />);
		}

		return (
			<div>
				<div className="row page-header">
					<div className="col-md-8">
						<h3><Paperclip /> Reference Attachments </h3>
					</div>
				</div>
				<div className="row">
					<div className="col-md-4 attachment_checkbox" style={{ maxHeight: "500px", overflowY: "auto" }}>
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

var mapStoreToProps = function (store, ownProps) {
	return {
		auditStore: store.auditStores[ownProps.auditStoreId],
	};
};

export default ReactRedux.connect(mapStoreToProps)(ReferenceAttachmentBox);