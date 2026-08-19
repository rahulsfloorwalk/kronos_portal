import React from "react";
import PropTypes from "prop-types";
import Modal from "../../components/Modal.jsx";
import AttachmentThumbnail from "../../components/AttachmentThumbnail.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import Alert from "react-s-alert";
import { findAttachmentComments, saveAttachmentComments } from "../service/attachment.js";

const extractErrorMessage = (err, fallback = "Something went wrong") => {
	if (err && err.responseJSON) {
		if (err.responseJSON.non_field_errors && err.responseJSON.non_field_errors.length) {
			return err.responseJSON.non_field_errors[0];
		}
		const firstKey = Object.keys(err.responseJSON)[0];
		if (firstKey && Array.isArray(err.responseJSON[firstKey]) && err.responseJSON[firstKey].length) {
			return err.responseJSON[firstKey][0];
		}
	}
	return fallback;
};

export default class AttachmentCommentModal extends React.Component {
	static propTypes = {
		auditStoreId: PropTypes.number,
		sectionId: PropTypes.number,
		attachments: PropTypes.array,
		proof_tags: PropTypes.array,
		onClose: PropTypes.func,
		onSaved: PropTypes.func,
	};

	state = {
		comments: {},
		initialComments: {},
		fetching: false,
		saving: false,
		hasUnsavedChanges: false,
		showLeaveConfirm: false,
	};

	componentDidMount() {
		this.fetchExistingComments();
	}

	fetchExistingComments = () => {
		this.setState({ fetching: true });
		findAttachmentComments(this.props.auditStoreId, this.props.sectionId).then(
			(data) => {
				const list = Array.isArray(data) ? data : [];
				const commentMap = {};
				list.forEach((item) => {
					commentMap[item.id] = item.attachment_comment || "";
				});
				this.setState({
					comments: commentMap,
					initialComments: commentMap,
					hasUnsavedChanges: false,
					fetching: false,
				});
			},
			(err) => {
				Alert.error(extractErrorMessage(err, "Could not load comments"));
				this.setState({ fetching: false });
			}
		);
	};

	handleCommentChange = (attachmentId, value) => {
		this.setState((prevState) => {
			const updatedComments = Object.assign({}, prevState.comments, { [attachmentId]: value });
			const changed = this.props.attachments.some(
				(a) => (updatedComments[a.id] || "") !== (prevState.initialComments[a.id] || "")
			);
			return { comments: updatedComments, hasUnsavedChanges: changed };
		});
	};

	getAllCommentsFilled = () => {
		return this.props.attachments.every(
			(a) => (this.state.comments[a.id] || "").trim().length > 0
		);
	};

	canSave = () => {
		return (
			this.state.hasUnsavedChanges &&
			this.getAllCommentsFilled() &&
			!this.state.saving &&
			!this.state.fetching
		);
	};

	handleSave = () => {
		if (!this.canSave()) return;
		this.setState({ saving: true });
		const payload = this.props.attachments.map((a) => ({
			attachment_id: a.id,
			attachment_comment: this.state.comments[a.id] || "",
		}));
		saveAttachmentComments(this.props.auditStoreId, this.props.sectionId, payload).then(
			() => {
				Alert.success("Comments saved successfully");
				this.setState({ saving: false, hasUnsavedChanges: false });
				if (this.props.onSaved) this.props.onSaved();
			},
			(err) => {
				Alert.error(extractErrorMessage(err));
				this.setState({ saving: false });
			}
		);
	};

	handleRequestClose = () => {
		if (!this.state.hasUnsavedChanges) {
			this.props.onClose();
			return;
		}
		this.setState({ showLeaveConfirm: true });
	};

	confirmLeave = () => {
		this.setState({ showLeaveConfirm: false });
		this.props.onClose();
	};

	cancelLeaveConfirm = () => {
		this.setState({ showLeaveConfirm: false });
	};

	render() {
		const { attachments } = this.props;
		const { comments, fetching, saving, showLeaveConfirm } = this.state;
		const canSave = this.canSave();

		return (
			<React.Fragment>
				<Modal modalTitle="Add Comments" onClose={this.handleRequestClose} size="modal-lg">
					{fetching ? (
						<div className="text-center" style={{ padding: "2rem" }}>
							<span>Loading...</span>
						</div>
					) : (
						<div>
							{attachments.map((a) => (
								<div key={a.id} className="row" style={{ marginBottom: "1.5rem" }}>
									<div className="col-md-4">
										<AttachmentThumbnail
											attachment={a}
											onSelect={() => {}}
											onDelete={() => {}}
											deletable={false}
											selected={false}
											user="moderator"
											editable={false}
											faulty_report_id={a.faulty_report_id}
											faulty_attachment_url={a.faulty_attachment_url}
											proof_tags={this.props.proof_tags || []}
											section_id={this.props.sectionId}
											onChange={() => {}}
										/>
									</div>
									<div className="col-md-8">
										<textarea
											className="form-control"
											rows="3"
											placeholder="Add comment for this attachment"
											value={comments[a.id] || ""}
											onChange={(e) => this.handleCommentChange(a.id, e.target.value)}
										/>
									</div>
								</div>
							))}
							<div style={{ textAlign: "right", marginTop: "1rem" }}>
								<button
									className="btn btn-primary"
									disabled={!canSave}
									onClick={this.handleSave}
									style={{ marginRight: "8px" }}
								>
									{saving ? "Saving..." : "Save"}
								</button>
								<button className="btn btn-default" onClick={this.handleRequestClose}>
									Cancel
								</button>
							</div>
						</div>
					)}
				</Modal>
				{showLeaveConfirm && (
					<ConfirmDialog
						title="Leave without saving?"
						message="Your comments will not be saved. Are you sure you want to leave?"
						confirmText="Yes, leave"
						cancelText="No, stay"
						onConfirm={this.confirmLeave}
						onCancel={this.cancelLeaveConfirm}
					/>
				)}
			</React.Fragment>
		);
	}
}