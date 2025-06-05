import React, { Component } from "react";
import PropTypes from "prop-types";
import { } from "react-router";
// import $ from "jquery";

import { } from "../../styles.js";
import "../../../css/bs_overrides.scss";
import Loading from "../../components/Loading.jsx";
import Modal from "../../components/Modal.jsx";

import AttachmentInProgressThumbnail from "../../components/AttachmentInProgressThumbnail.jsx";
import AttachmentThumbnail from "../../components/AttachmentThumbnail.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";
import { Tasks, Checked, Unchecked, Paperclip, Pencil } from "../../components/Icons.jsx";

import { affectInputEventToComponent } from "../../react_utils.js";
import { fetchAnswers, setAnswerText, setMarks, setAnswerNotApplicable, setAnswerComment, setAnswerRevertMessage } from "../service/answer.js";
import { fetchSections, fetchReportSections, submitAuditorComment, setNotApplicable, setSectionRevertMessage } from "../service/section.js";
// import { findAttachmentsByAuditStoreAndSection, renameAttachment, deleteAttachment, uploadFileForReportSection ,moveAttachmentToSection, rotateImageAngle } from "../service/attachment.js";
import { findAttachmentsByAuditStoreAndSection, renameAttachment, deleteAttachment, uploadFileForReportSection, rotateImageAngle } from "../service/attachment.js";

import AttachmentPreview from "../../manager/components/AttachmentPreview.jsx";
import ProofTagLabel from "../../components/ProofTagLabel.jsx";

import { fetchproofTags, saveAttachmentTag } from "../service/proof_tag.js";
// import { GrammarlyEditorPlugin} from "@grammarly/editor-sdk-react";
// import { ClientID } from "../../constants.js";

class AnswerComment extends Component {

	static propTypes = {
		answer_comment: PropTypes.string,
		optional_comment_required: PropTypes.bool,
		audit_store_id: PropTypes.number,
		question_id: PropTypes.number,
		editable: PropTypes.bool,
	};

	constructor(props) {
		super(props);
		this.state = {
			answer_comment: props.answer_comment || "",
			error: false,
			success: false,
		};
		this.answerCommentRef = React.createRef();
	}

	setError = (error) => {
		this.setState(prevState => Object.assign({}, prevState, { error }));
	};

	setSuccess = (success) => {
		this.setState(prevState => Object.assign({}, prevState, { success }));
	};

	commentChanged = (e) => {
		this.setState({
			answer_comment: e.target.value,
		},
		() => {
			this.autoResizeTextarea(); // Resize on input change
		});
	};

	onBlur = (e) => {
		this.commentChanged(e);
		setAnswerComment(this.props.audit_store_id, this.props.question_id, e.target.value).then(() => {
			this.setSuccess(true);
			this.setError(false);
		}, () => {
			this.setSuccess(false);
			this.setError(true);
		});
	};


	componentDidMount() {
		// Resize textarea on mount
		this.autoResizeTextarea();
	}

	componentDidUpdate(prevProps, prevState) {
		// Resize when answer_comment changes
		if (
			prevState.answer_comment !== this.state.answer_comment &&
			this.answerCommentRef.current
		) {
			this.autoResizeTextarea();
		}
	}

	autoResizeTextarea = () => {
		const textarea = this.answerCommentRef.current;
		if (textarea) {
			textarea.style.height = "auto"; // Reset height
			textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
		}
	};
	render() {
		if (this.props.editable) {
			let hasSuccess = this.state.success ? "has-success" : "";
			let hasError = this.state.error ? "has-error" : "";
			return (
				<div className={`${hasSuccess} ${hasError}`}>
					<textarea className="form-control" value={this.state.answer_comment} onChange={this.commentChanged} onBlur={this.onBlur} placeholder="optional comment" rows="1" style={this.props.optional_comment_required ? { border: "1px solid red" } : {}} />
				</div>
			);
		} else {
			return this.props.answer_comment ? <span> ( {this.props.answer_comment})</span> : null;
		}
	}
}

export class QuestionRow extends React.Component {
	static propTypes = {
		q: PropTypes.shape({
			id: PropTypes.number,
			max_marks: PropTypes.number,
			question_type: PropTypes.string,
			question_txt: PropTypes.string,
			sequence: PropTypes.number,
			hide_question: PropTypes.bool,
			question_data: PropTypes.shape({
				options: PropTypes.arrayOf(PropTypes.shape({
					sequence: PropTypes.number,
					value: PropTypes.string,
				})),
			}),
		}),
		answer: PropTypes.shape({
			answer_comment: PropTypes.string,
			revert_message: PropTypes.string,
			optional_comment_required: PropTypes.bool,
			get_answer_text_list: PropTypes.oneOfType([PropTypes.array, PropTypes.string, PropTypes.undefined])
		}),
		marking: PropTypes.bool,

		auditStoreId: PropTypes.number,
		auditStore: PropTypes.shape({
			status: PropTypes.string,
		}),
	};

	static defaultProps = {
		marking: false
	};

	state = {
		answer: {},
		error: false,
		marksObtainedSuccess: false,
		answerError: false,
		answerSuccess: false,
		show_revert_form: false,
	};

	textareaRef = React.createRef();

	componentDidMount() {
		// if (this.props.answer) {
		//   this.setState({
		//     answer: this.props.answer,
		//   });
		// }
		if (this.props.answer) {
			this.setState(
				{
					answer: this.props.answer,
				},
				() => {
					this.autoResizeTextarea(); // Resize on mount
				}
			);
		}
	}

	componentDidUpdate(prevProps, prevState) {
		// Resize when answer_text changes
		if (
			prevState.answer.answer_text !== this.state.answer.answer_text &&
			this.textareaRef.current
		) {
			this.autoResizeTextarea();
		}
	}

	autoResizeTextarea = () => {
		const textarea = this.textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto"; // Reset height
			textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
		}
	};
	/*
	  componentWillReceiveProps: function(nextProps){
		  if(nextProps.answer){
			  this.setState({
				  answer: nextProps.answer
			  });
		  }
	  },
	  */
	answerChanged = (e) => {
		this.setState({
			answer: Object.assign({}, this.state.answer, {
				answer_text: e.target.value,
			}),
		},
		() => {
			this.autoResizeTextarea(); // Resize on input change
		});
	};
	saveAnswer = (e) => {
		this.answerChanged(e);
		setAnswerText(this.props.auditStoreId, this.props.q.id, this.state.answer.answer_text, true).then((answer) => this.setState({ answer, answerError: false, answerSuccess: true }), () => this.setState({ answerError: true, answerSuccess: false }));
	};
	submitMultiSelectAnswer = (e) => {
		setAnswerText(this.props.auditStoreId, this.props.q.id, e.target.value, e.target.checked).then((answer) => this.setState({ answer, answerError: false, answerSuccess: true }));
	};
	marksChanged = (e) => {
		this.setState({
			answer: Object.assign({}, this.state.answer, {
				marks_obtained: e.target.value
			})
		});
	};
	saveMarks = (e) => {
		this.marksChanged(e);
		setMarks(this.props.auditStoreId, this.props.q.id, this.state.answer.marks_obtained).then(() => this.setState({ error: false, marksObtainedSuccess: true }), () => this.setState({ error: true, marksObtainedSuccess: false }));
	};
	notApplicableClicked = () => {
		setAnswerNotApplicable(this.props.auditStoreId, this.props.q.id, !this.state.answer.not_applicable).then(answer => {
			this.setState({
				answer
			});
		});
	};
	toggleRevertForm = () => {
		this.setState((prevState) => ({
			answer: Object.assign({}, this.state.answer, {
				show_revert_form: !prevState.answer.show_revert_form,
			})
		}));
	};
	revertMessageChanged = (e) => {
		this.setState({
			answer: Object.assign({}, this.state.answer, {
				revert_message: e.target.value,
			})
		});
	};
	revertMessageSubmit = () => {
		if (this.state.answer.revert_message != "") {
			setAnswerRevertMessage(this.props.auditStoreId, this.props.q.id, this.state.answer.revert_message).then(() => this.toggleRevertForm());
		}
	};
	render() {
		if (this.props.q.hide_question && (this.state.answer.answer_text === "" || this.state.answer.answer_text === undefined)) {
			return null;
		}
		let notApplicableIcon = this.state.answer.not_applicable ? <Checked /> : <Unchecked />;

		let notApplicableElement = (notApplicableIcon);
		let markElement = (<span><b>{this.state.answer.marks_obtained}</b>&nbsp;/&nbsp;<b>{this.props.q.max_marks}</b></span>);
		let answerElement = (
			<span>
				<big>{this.state.answer.answer_text}</big>
				{this.props.q.question_type === "MUTEX" || this.props.q.question_type === "MULTISELECT"
					? <AnswerComment audit_store_id={this.props.auditStoreId} question_id={this.props.q.id} editable={false} answer_comment={this.props.answer ? this.props.answer.answer_comment : ""} optional_comment_required={this.props.answer ? this.props.answer.optional_comment_required : ""} />
					: null
				}
			</span>
		);
		if (this.props.marking) {
			let hasError = this.state.error ? "has-error" : "";
			let hasMarksObtainedSuccess = this.state.marksObtainedSuccess ? "has-success" : "";
			let answerMarksBg = this.props.q.max_marks && this.state.answer.marks_obtained == 0 ? { backgroundColor: "#ffc299" } : {};
			markElement = (
				<div className={`input-group ${hasError} ${hasMarksObtainedSuccess}`}>
					<input
						style={answerMarksBg}
						className="form-control text-right"
						onChange={this.marksChanged}
						onBlur={this.saveMarks}
						value={this.state.answer.marks_obtained} />
					<span className="input-group-addon">/&nbsp;{this.props.q.max_marks}</span>
				</div>
			);

			let hasAnswerError = this.state.answerError ? "has-error" : "";
			let hasAnswerSuccess = this.state.answerSuccess ? "has-success" : "";
			if (this.props.q.question_type === "PLAIN") {
				answerElement = (
					<div className={hasAnswerError + hasAnswerSuccess}>
						<textarea className="form-control"
							ref={this.textareaRef}
							style={{ resize: "none", overflow: "hidden" }}
							onChange={this.answerChanged}
							onBlur={this.saveAnswer}
							value={this.state.answer.answer_text}></textarea>
					</div>
				);
			} else if (this.props.q.question_type === "MUTEX") {
				answerElement = (
					<div className="row">
						<div className="col-xs-5">
							<div className={hasAnswerError + hasAnswerSuccess}>
								<select className="form-control"
									onChange={this.answerChanged}
									onBlur={this.saveAnswer}
									value={this.state.answer.answer_text}>
									<option value=""></option>
									{this.props.q.question_data.options.map(o => <option key={o.sequence} value={o.value}>{o.value}</option>)}
								</select>
							</div>
						</div>
						<div className="col-xs-7">
							<AnswerComment audit_store_id={this.props.auditStoreId} question_id={this.props.q.id} editable={true} answer_comment={this.props.answer ? this.props.answer.answer_comment : ""} optional_comment_required={this.props.answer ? this.props.answer.optional_comment_required : ""} />
						</div>
					</div>
				);
			} else if (this.props.q.question_type === "MULTISELECT") {
				let checkbox_list = [];
				let multiselect_answer_list = [];
				if (this.props.answer) {
					multiselect_answer_list = this.props.answer.get_answer_text_list;
				}
				for (let o of this.props.q.question_data.options) {
					if (multiselect_answer_list.includes(o.value)) {
						checkbox_list.push(<label style={{ fontSize: "14px", marginBottom: "10px" }} key={o.sequence}><input type="checkbox" value={o.value} name="answer_text" onClick={this.submitMultiSelectAnswer} defaultChecked style={{ verticalAlign: "bottom", width: "20px", height: "20px" }} /><span> {o.value}</span>&nbsp;</label>);
					}
					else {
						checkbox_list.push(<label style={{ fontSize: "14px", marginBottom: "10px" }} key={o.sequence}><input type="checkbox" value={o.value} name="answer_text" onClick={this.submitMultiSelectAnswer} style={{ verticalAlign: "bottom", width: "20px", height: "20px" }} /><span> {o.value}</span>&nbsp;</label>);
					}
				}
				answerElement = (
					<div className="row">
						<div className="col-xs-5">
							{checkbox_list}
							<br />
							{this.state.answer.answer_text}
						</div>
						<div className="col-xs-7">
							<AnswerComment audit_store_id={this.props.auditStoreId} question_id={this.props.q.id} answer_comment={this.props.answer ? this.props.answer.answer_comment : ""} editable={true} optional_comment_required={this.props.answer ? this.props.answer.optional_comment_required : ""} />
						</div>
					</div>
				);
			}

			notApplicableElement = (
				<button className="btn btn-default" onClick={this.notApplicableClicked}>
					{notApplicableIcon}
				</button>
			);
		}

		if (this.state.answer.not_applicable) {
			markElement = (<span className="text-muted">&nbsp;</span>);
			answerElement = (<span className="text-muted">not applicable</span>);
		}

		return (
			<tr>
				<td>{this.props.q.sequence}</td>
				<td>{this.props.q.question_txt}<br />{this.state.answer.revert_message ? <p className="text-danger"><b>Revert message: </b>{this.state.answer.revert_message}</p> : null}</td>
				<td>{answerElement}</td>
				<td className="text-right">{markElement}</td>
				<td className="">{notApplicableElement}</td>
				<td>
					{this.props.marking ? <button className={`btn btn-${this.state.answer.revert_message ? "primary" : "warning"}`} onClick={this.toggleRevertForm} title="Revert message"><Pencil /></button> : null}
					{this.state.answer.show_revert_form ? <Modal modalTitle="Enter revert message" onClose={this.toggleRevertForm}>
						<div className="table-responsive">
							<table className="table table-striped">
								<tbody>
									<tr>
										<th>Question</th>
										<td>{this.props.q.question_txt}</td>
									</tr>
									<tr>
										<th>Answer</th>
										<td>{this.state.answer.answer_text}</td>
									</tr>
									<tr>
										<th>Answer comment</th>
										<td>{this.state.answer.answer_comment}</td>
									</tr>
									<tr>
										<td colSpan={2}>
											<textarea className="form-control" name="revert_message" value={this.state.answer.revert_message} onChange={this.revertMessageChanged} placeholder="Enter revert message" />
										</td>
									</tr>
									<tr>
										<td colSpan={2}>
											<button className="btn btn-primary" onClick={this.revertMessageSubmit} disabled={this.state.answer.revert_message == ""}>Submit</button>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</Modal> : null}
				</td>
			</tr>
		);
	}
}


class SectionAttachmentBox extends React.Component {
	static propTypes = {
		sectionId: PropTypes.number,
		auditStoreId: PropTypes.number,
		auditStore: PropTypes.shape({
			status: PropTypes.string,
		}),
		editable: PropTypes.bool,
		// sections:PropTypes.array,
		proof_tags: PropTypes.array,
		handleSectionProofChange: PropTypes.func,
	};

	constructor(props) {
		super(props);
		this.state = {
			attachments: [],
			inProgress: {},
			selectedAttachmentId: null,
			// attachmentSectionId: "",
			submitMessage: "",
			submitStatus: "",
			showErrors: false,
			disableRotateButton: false
		};
	}

	reloadAttachments = (auditStoreId, sectionId) => {
		findAttachmentsByAuditStoreAndSection(auditStoreId, sectionId).then((attachments) => {
			this.setState({
				attachments
			});
		});
	};

	componentDidMount() {
		this.reloadAttachments(this.props.auditStoreId, this.props.sectionId);
	}

	componentWillReceiveProps(nextProps) {
		if (!(this.props.auditStoreId === nextProps.auditStoreId && this.props.sectionId === nextProps.sectionId)) {
			this.reloadAttachments(nextProps.auditStoreId, nextProps.sectionId);
		}
	}

	uploadButtonClicked = () => {
		this.uploadInput.click();
	};

	setProgressState = (tempId, progressState) => {
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				inProgress: Object.assign({}, prevState.inProgress, {
					[tempId]: Object.assign({}, prevState.inProgress[tempId], progressState)
				})
			});
		});
	};

	uploadFile = () => {
		if (this.uploadInput.files.length > 10) {
			alert("You can only upload 10 attachments at once");
			return;
		}
		for (let toUploadFile of this.uploadInput.files) {
			let tempId = Math.random().toString(36).substring(7);
			this.setProgressState(tempId, {
				uploading: true,
				file: toUploadFile
			});
			var promise = uploadFileForReportSection(this.props.auditStoreId, this.props.sectionId, toUploadFile);
			promise.progress((type, percent) => {
				if (type === "INIT") {
					this.setProgressState(tempId, {
						uploadMessage: "initializing upload",
						active: false,
					});
				}
				if (type === "STARTING_UPLOAD") {
					this.setProgressState(tempId, {
						uploadMessage: "starting upload",
						active: true,
					});
				}
				if (type === "UPLOAD_PROGRESS") {
					this.setProgressState(tempId, {
						uploadMessage: "",
						progress: Math.floor(percent)
					});
				}
			});
			promise.always(() => {
				this.setProgressState(tempId, {
					progress: "",
					uploading: false,
					active: false
				});
			});
			promise.then(() => {
				this.setProgressState(tempId, {
					uploadMessage: "upload successful",
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

	attachmentDeleteClicked = (attachment) => {
		deleteAttachment(attachment.id).then(() => {
			this.props.handleSectionProofChange();
			this.reloadAttachments(this.props.auditStoreId, this.props.sectionId);
		});
	};

	selectedAttachmentRenamed = (newName) => {
		renameAttachment(this.state.selectedAttachmentId, newName).then(() => {
			this.reloadAttachments(this.props.auditStoreId, this.props.sectionId);
		});
	};

	saveAttachmentTag = (attachmentId, e) => {
		saveAttachmentTag(attachmentId, e.target.value).then(() => {
			this.reloadAttachments(this.props.auditStoreId, this.props.sectionId);
			this.props.handleSectionProofChange();
		});
	};

	selectAttachment = (attachmentId) => {
		if (this.state.selectedAttachmentId === attachmentId) {
			this.setState({
				selectedAttachmentId: null
			});
		} else {
			this.setState({
				selectedAttachmentId: attachmentId
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

	rotateImage = (angle) => {
		this.setState({ disableRotateButton: true });
		rotateImageAngle(this.state.selectedAttachmentId, angle).then(() => {
			this.reloadAttachments(this.props.auditStoreId, this.props.sectionId);
			this.setState({ disableRotateButton: false });
		});
	};

	render() {
		let submitMessageElement = <big><b className={this.state.submitStatus ? "text-" + this.state.submitStatus : ""}>{this.state.submitMessage}</b></big>;

		let uploadButton;
		let editable = false;

		if (this.props.auditStore && this.props.auditStore.status === "SUBMITTED") {
			uploadButton = (<button onClick={this.uploadButtonClicked} type="button" className="btn btn-default btn-sm"><Paperclip /> Upload</button>);
			editable = true;
		}

		let attachmentRows = [];
		for (let a of this.state.attachments) {
			attachmentRows.push(<AttachmentThumbnail
				key={a.id}
				attachment={a}
				onSelect={() => this.selectAttachment(a.id)}
				onDelete={() => this.attachmentDeleteClicked(a)}
				deletable={this.props.auditStore && this.props.auditStore.status === "SUBMITTED"}
				selected={a.id === this.state.selectedAttachmentId}
				user="moderator"
				editable={this.props.editable}
				faulty_report_id={a.faulty_report_id}
				faulty_attachment_url={a.faulty_attachment_url}
				proof_tags={this.props.proof_tags}
				section_id={this.props.sectionId}
				onChange={(e) => this.saveAttachmentTag(a.id, e)}
			/>);
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
			attachmentRows.push(" ");
		}

		// let sectionSelect = null;

		if (attachmentRows.length === 0) {
			attachmentRows.push(<span key="empty" className="text-muted">no attachments here&nbsp;</span>);
		}
		/*else{
				if (this.props.editable){
					sectionSelect = (
						<div className="col-md-4">
							<div className="col-md-8">
								<select className="form-control" onChange={this.getAttachmentSectionId}>
									<option value="">Select Section</option>
									<option key="0" value="0">Main Section</option>
									{this.props.sections.map((s) => s.id === this.props.sectionId ? null : (<option key={s.id} value={s.id}>{s.name}</option>) )}
								</select>
							</div>
							<div className="col-md-2">
								<button className="btn btn-default btn-sm" onClick={this.moveAttachmentSection}>Move to</button>
							</div>
						</div>
					);
				}
			}*/

		let selectedAttachment = this.state.attachments.filter(a => a.id === this.state.selectedAttachmentId)[0];

		const section_proof_tags = this.props.proof_tags.filter((val) => val.section_id == this.props.sectionId);
		const attachment_tags = this.state.attachments.map((value) => value.proof_tag);

		const proof_tag_list = [];
		for (let tag of section_proof_tags) {
			const attach = attachment_tags.includes(tag.id);
			proof_tag_list.push(<ProofTagLabel key={tag.id} proof_tag={tag} attached={attach} is_required={tag.is_required} />);
		}

		return (
			<div>
				<div className="panel-body">
					<div className="col-md-8">
						<h4>Attachments {uploadButton}</h4>
						<p>{proof_tag_list}</p>
						{submitMessageElement}
					</div>
					{/* {sectionSelect} */}
				</div>

				<div className={`panel-body attachment_checkbox_section${this.props.sectionId}`}>
					<div className="row">
						<div className={`col-md-${this.state.selectedAttachmentId ? "4" : "12"} attachment_checkbox`} style={{ maxHeight: "500px", overflowY: "auto" }}>
							{attachmentRows}
							<input type="file" multiple
								onChange={this.uploadFile}
								ref={(input) => this.uploadInput = input}
								style={{ "display": "none" }} />
						</div>
						<div className="col-md-8" style={{ display: this.state.selectedAttachmentId ? "block" : "none" }}>
							<AttachmentPreview attachment={selectedAttachment} editable={editable}
								proof_tags={this.props.proof_tags}
								onRename={this.selectedAttachmentRenamed}
								onDelete={() => this.attachmentDeleteClicked(selectedAttachment)}
								onChange={(e) => this.saveAttachmentTag(selectedAttachment.id, e)}
								rotateImage={this.rotateImage}
								section_id={this.props.sectionId}
								disableRotateButton={this.state.disableRotateButton} />
						</div>
					</div>
				</div>
			</div>
		);
	}
}



class Section extends React.Component {
	static propTypes = {
		reportSection: PropTypes.shape({
			auditor_comment: PropTypes.string,
			revert_message: PropTypes.string,
			pm_comment: PropTypes.string,
			not_applicable: PropTypes.bool,
			marks_obtained: PropTypes.number,
			max_marks: PropTypes.number,
		}),
		auditStoreId: PropTypes.number,
		section: PropTypes.shape({
			id: PropTypes.number,
			sequence: PropTypes.number,
			name: PropTypes.string,
			max_marks: PropTypes.number,
			questions: PropTypes.array,
			hide_comment: PropTypes.bool,
		}),
		auditStore: PropTypes.shape({
			status: PropTypes.string,
		}),
		answers: PropTypes.array,
		// sections:PropTypes.array,
		proof_tags: PropTypes.array,
		handleSectionProofChange: PropTypes.func,
	};

	state = {
		//pmCommentError: false,
		auditorCommentError: false,

		//pmCommentSuccess: false,
		auditorCommentSuccess: false,

		//savingPMComment: false,
		savingAuditorComment: false,

		auditor_comment: "",
		pm_comment: "",
		revert_message: "",
		show_revert_form: false,

		//set initial state to true so that you don't get setState() calls
		// on an unmounted component
		not_applicable: true,
		// sections:[],
	};

	componentDidMount() {
		if (this.props.reportSection) {
			this.setState({
				revert_message: this.props.reportSection.revert_message,
				auditor_comment: this.props.reportSection.auditor_comment,
				pm_comment: this.props.reportSection.pm_comment,
				not_applicable: this.props.reportSection.not_applicable,
			});

			/*fetchSections(this.props.auditStoreId).then((sections) => {
					  this.setState({
						  sections
					  });
				  });*/
		}
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.reportSection) {
			this.setState({
				revert_message: nextProps.reportSection.revert_message,
				auditor_comment: nextProps.reportSection.auditor_comment,
				pm_comment: nextProps.reportSection.pm_comment,
				not_applicable: nextProps.reportSection.not_applicable
			});
		}
	}
	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};
	saveAuditorComment = (e) => {
		e.preventDefault();
		if (this.props.reportSection && this.props.reportSection.auditor_comment === this.state.auditor_comment) {
			return;
		}
		this.setState({
			savingAuditorComment: true,
			auditorCommentError: false,
			auditorCommentSuccess: false,
		});
		submitAuditorComment(this.props.auditStoreId, this.props.section.id, this.state.auditor_comment).then(() => {
			this.setState({
				auditorCommentError: false,
				auditorCommentSuccess: true,
			});
		}, () => {
			this.setState({
				auditorCommentError: true,
				auditorCommentSuccess: false,
			});
		}).always(() => {
			this.setState({ savingAuditorComment: false });
		});
	};
	/* savePMComment = (e) => {
		  e.preventDefault();
		  if(this.props.reportSection && this.props.reportSection.pm_comment === this.state.pm_comment){
			  return;
		  }
		  this.setState({
			  savingPMComment: true,
			  pmCommentError: false,
			  pmCommentSuccess: false,
		  });
		  submitPMComment(this.props.auditStoreId, this.props.section.id, this.state.pm_comment).then(()=> {
			  this.setState({
				  pmCommentError: false,
				  pmCommentSuccess: true,
			  });
		  }, () => {
			  this.setState({
				  pmCommentSuccess: false,
				  pmCommentError: true,
			  });
		  }).always(() => {
			  this.setState({savingPMComment: false});
		  });
	  }; */
	notApplicableButtonClicked = () => {
		this.setState({
			not_applicable: !this.state.not_applicable,
		});
		setNotApplicable(this.props.auditStoreId, this.props.section.id, !this.state.not_applicable);
	};
	toggleRevertForm = () => {
		this.setState((prevState) => ({
			show_revert_form: !prevState.show_revert_form,
		}));
	};
	revertMessageChanged = (e) => {
		this.setState({
			revert_message: e.target.value,
		});
	};
	revertMessageSubmit = () => {
		if (this.state.revert_message != "") {
			setSectionRevertMessage(this.props.auditStoreId, this.props.section.id, this.state.revert_message).then(() => this.toggleRevertForm());
		}
	};
	render() {

		let editable = this.props.auditStore && this.props.auditStore.status === "SUBMITTED";

		/* QUESTION ROWS */
		let questionRows = [];
		if (this.props.section.questions) {
			for (let q of this.props.section.questions) {
				let answer = this.props.answers.filter(a => a.question === q.id)[0];
				questionRows.push(<QuestionRow q={q} key={q.id} answer={answer} marking={editable} auditStore={this.props.auditStore} auditStoreId={this.props.auditStoreId} />);
			}
		}
		if (questionRows.length === 0) {
			questionRows.push(<tr key="empty"><td colSpan="4" className="text-center text-muted">no questions here</td></tr>);
		}

		let auditorCommentElement = (<span className="text-muted">auditor comment is empty</span>);
		// let pmCommentElement = (<span className="text-muted">PM comment is empty</span>);
		let marksObtained = 0;
		let maxMarks = this.props.section.max_marks;
		let notApplicableCheckboxIcon = <Unchecked />;
		let notApplicableElement = (<span className="">{notApplicableCheckboxIcon}</span>);

		/* AUDITOR COMMENT, PM COMMENT */
		if (this.props.reportSection) {
			marksObtained = this.props.reportSection.marks_obtained;
			maxMarks = this.props.reportSection.max_marks;

			// pmCommentElement = this.state.pm_comment ? (<span>{this.state.pm_comment}</span>) : pmCommentElement;
			auditorCommentElement = this.state.auditor_comment ? (<span>{this.state.auditor_comment}</span>) : auditorCommentElement;
			notApplicableCheckboxIcon = this.state.not_applicable ? <Checked /> : <Unchecked />;
			notApplicableElement = (<span className="">{notApplicableCheckboxIcon}</span>);
		}

		if (editable) {
			/* let hasPmCommentError = this.state.pmCommentError ? "has-error" : "";
				  let hasPmCommentSuccess = this.state.pmCommentSuccess ? "has-success" : "";
				  pmCommentElement = (
					  <div className={hasPmCommentError + hasPmCommentSuccess}>
						  <textarea
							  disabled={this.state.savingPMComment}
							  placeholder="enter PM comment here"
							  required="true"
							  className="form-control"
							  name="pm_comment"
							  value={this.state.pm_comment}
							  onBlur={this.savePMComment}
							  onChange={this.inputChanged}
						  />
					  </div>
				  ); */

			let hasAuditorCommentError = this.state.auditorCommentError ? "has-error" : "";
			let hasAuditorCommentSuccess = this.state.auditorCommentSuccess ? "has-success" : "";
			auditorCommentElement = (
				<div className={hasAuditorCommentError + hasAuditorCommentSuccess} style={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
					<div style={{ width: "95%", float: "left" }}>
						<textarea
							maxLength="4096"
							disabled={this.state.savingAuditorComment}
							placeholder="enter auditor comment here"
							required="true"
							className="form-control"
							name="auditor_comment"
							value={this.state.auditor_comment}
							onBlur={this.saveAuditorComment}
							onChange={this.inputChanged}
						/>
					</div>&nbsp;&nbsp;
					<div style={{ width: "5%", float: "right", flex: "none" }}>
						<button className={`btn btn-${this.state.revert_message ? "primary" : "warning"}`} onClick={this.toggleRevertForm} title="Revert message"><Pencil /></button>
					</div>
				</div>
			);

			notApplicableElement = (<button className="btn btn-default btn-sm" onClick={this.notApplicableButtonClicked}>{notApplicableCheckboxIcon}</button>);
		}

		var styles = {
			col1: { width: "2.5%" },
			col2: { width: "40%" },
			col3: { width: "40%" },
			col4: { width: "15%" },
			col5: { width: "2.5%" },
		};

		let panelBody;
		if (this.state.not_applicable) {
			panelBody = (<div className="panel-footer text-center text-muted">section not applicable</div>);
		} else {
			panelBody = (<div className="report_scroll">
				<table className="table table-striped">
					<thead>
						<tr>
							<th style={styles.col1}>#</th>
							<th style={styles.col2}>Question</th>
							<th style={styles.col3}>Answer</th>
							<th style={styles.col4}>Marks</th>
							<th style={styles.col5}>N/A</th>
						</tr>
					</thead>
					<tbody>
						{questionRows}
					</tbody>
				</table>
				<div className="panel-footer">
					<p><b>Total Marks:</b> {marksObtained} out of {maxMarks}</p>
					{this.props.section.hide_comment == false ?
						<div>
							<hr />
							<b>Auditor Comment:</b>&nbsp;
							{this.state.savingAuditorComment ? "saving..." : ""}
							{auditorCommentElement}
							<br /><br />
							{this.state.revert_message || this.props.reportSection.revert_message ? <p className="text-danger"><b>Revert message: </b>{this.state.revert_message || this.props.reportSection.revert_message}</p> : null}
						</div> : null}
					{/* <hr/>
					<div><b>PM Comment:</b>&nbsp;{ this.state.savingPMComment ? "saving..." : ""} {pmCommentElement}</div> */}
					{this.props.section.hide_comment == false && this.state.show_revert_form ? <Modal modalTitle="Enter revert message" onClose={this.toggleRevertForm}>
						<div className="table-responsive">
							<table className="table table-striped">
								<tbody>
									<tr>
										<th>Section summary</th>
										<td>{this.state.auditor_comment}</td>
									</tr>
									<tr>
										<td colSpan={2}>
											<textarea className="form-control" name="revert_message" value={this.state.revert_message} onChange={this.revertMessageChanged} placeholder="Enter revert message" />
										</td>
									</tr>
									<tr>
										<td colSpan={2}>
											<button className="btn btn-primary" onClick={this.revertMessageSubmit} disabled={this.state.revert_message == ""}>Submit</button>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</Modal> : null}
				</div>
				{/* <SectionAttachmentBox auditStoreId={this.props.auditStoreId} sectionId={this.props.section.id} auditStore={this.props.auditStore} sections={this.props.sections} editable={editable} proof_tags={this.props.proof_tags}/> */}
				<SectionAttachmentBox auditStoreId={this.props.auditStoreId} sectionId={this.props.section.id} auditStore={this.props.auditStore} editable={editable} proof_tags={this.props.proof_tags} handleSectionProofChange={this.props.handleSectionProofChange} />
			</div>);
		}
		return (
			<div className="panel panel-default">
				<span className="pull-right"><b>N/A:</b> {notApplicableElement}</span>
				<div className="panel-heading">
					<h4 className="panel-title">
						{this.props.section.sequence} - {this.props.section.name}
					</h4>
				</div>
				{panelBody}
			</div>
		);
	}
}

export default class AuditStoreSections extends React.Component {
	static propTypes = {
		auditStoreId: PropTypes.number,
		auditStore: PropTypes.shape({
			status: PropTypes.string,
			audit: PropTypes.object
		}),
		children: PropTypes.node,
		editable: PropTypes.bool,
		sections: PropTypes.object,
		handleSectionProofChange: PropTypes.func,
	};

	state = {
		sections: [],
		reportSections: [],
		answers: [],
		proof_tags: [],
		loading: false
	};

	setLoading = (loading) => this.setState(prevState => Object.assign({}, prevState, { loading }));

	componentDidMount() {
		this.setLoading(true);
		Promise.all([
			fetchSections(this.props.auditStoreId),
			fetchAnswers(this.props.auditStoreId),
			fetchReportSections(this.props.auditStoreId),
			fetchproofTags(this.props.auditStore.audit.audit_cycle.id)
		]).then(([sections, answers, reportSections, proof_tags]) => {
			this.setState({
				sections,
				answers,
				reportSections,
				proof_tags
			});
		}).finally(() => this.setLoading(false));
	}
	render() {
		//var orderedKeys = orderKeys(this.props.sections, function(s1,s2){
		//	return s1.sequence - s2.sequence;
		//});
		if (this.state.loading) {
			return <Loading />;
		}
		var sectionRows = [];
		for (var section of this.state.sections) {
			let reportSection = this.state.reportSections.filter(rs => rs.section === section.id)[0];
			sectionRows.push(<Section key={section.id}
				auditStoreId={this.props.auditStoreId}
				auditStore={this.props.auditStore}
				section={section}
				reportSection={reportSection}
				answers={this.state.answers}
				// sections={this.state.sections}
				editable={this.props.editable}
				proof_tags={this.state.proof_tags}
				handleSectionProofChange={this.props.handleSectionProofChange}
			/>);
		}
		if (sectionRows.length === 0) {
			sectionRows.push(<Jumbotron key="empty" heading="this questionnaire is empty" para="please add a section from the questionnaire" />);
		}
		return (
			<div>
				<h3 className="page-header"><Tasks /> Questionnaire</h3>
				{sectionRows}
				{this.props.children}
			</div>
		);
	}
}

