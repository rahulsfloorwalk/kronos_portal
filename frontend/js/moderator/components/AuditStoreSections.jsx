import React, { Component } from "react";
import PropTypes from "prop-types";
import { } from "react-router";
// import $ from "jquery";

import { } from "../../styles.js";

import AttachmentInProgressThumbnail from "../../components/AttachmentInProgressThumbnail.jsx";
import AttachmentThumbnail from "../../components/AttachmentThumbnail.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";
import { Tasks, Checked, Unchecked, Paperclip } from "../../components/Icons.jsx";

import { affectInputEventToComponent } from "../../react_utils.js";
import { fetchAnswers, setAnswerText, setMarks, setAnswerNotApplicable, setAnswerComment } from "../service/answer.js";
import { fetchSections, fetchReportSections, submitAuditorComment, setNotApplicable } from "../service/section.js";
// import { findAttachmentsByAuditStoreAndSection, renameAttachment, deleteAttachment, uploadFileForReportSection ,moveAttachmentToSection, rotateImageAngle } from "../service/attachment.js";
import { findAttachmentsByAuditStoreAndSection, renameAttachment, deleteAttachment, uploadFileForReportSection, rotateImageAngle } from "../service/attachment.js";

import AttachmentPreview from "../../manager/components/AttachmentPreview.jsx";

import { fetchproofTags, saveAttachmentTag } from "../service/proof_tag.js";

class AnswerComment extends Component {

	static propTypes = {
		answer_comment: PropTypes.string,
		audit_store_id: PropTypes.number,
		question_id: PropTypes.number,
		editable: PropTypes.bool,
	};

	constructor(props){
		super(props);
		this.state = {
			answer_comment: props.answer_comment || "",
			error: false,
			success: false,
		};
	}

	setError = (error) => {
		this.setState( prevState => Object.assign({}, prevState, { error }));
	};

	setSuccess = (success) => {
		this.setState( prevState => Object.assign({}, prevState, { success }));
	};

	commentChanged = (e) => {
		this.setState({
			answer_comment: e.target.value,
		});
	};

	onBlur = (e) => {
		this.commentChanged(e);
		setAnswerComment(this.props.audit_store_id, this.props.question_id, e.target.value).then( () => {
			this.setSuccess(true);
			this.setError(false);
		}, () => {
			this.setSuccess(false);
			this.setError(true);
		});
	};

	render(){
		if(this.props.editable){
			let hasSuccess = this.state.success ? "has-success" : "";
			let hasError = this.state.error ? "has-error" : "";
			return (
				<div className={`${hasSuccess} ${hasError}`}>
					<textarea className="form-control" value={this.state.answer_comment} onChange={this.commentChanged} onBlur={this.onBlur} placeholder="optional comment" rows="1"/>
				</div>
			);
		} else {
			return this.props.answer_comment ? <span> ( {this.props.answer_comment})</span> : null;
		}
	}
}

export class QuestionRow extends React.Component{
	static propTypes = {
		q: PropTypes.shape({
			id: PropTypes.number,
			max_marks: PropTypes.number,
			question_type: PropTypes.string,
			question_txt: PropTypes.string,
			sequence: PropTypes.number,
			question_data: PropTypes.shape({
				options: PropTypes.arrayOf(PropTypes.shape({
					sequence: PropTypes.number,
					value: PropTypes.string,
				})),
			}),
		}),
		answer: PropTypes.shape({
			answer_comment: PropTypes.string,
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
		answerSuccess: false
	};

	componentDidMount(){
		if(this.props.answer){
			this.setState({
				answer: this.props.answer
			});
		}
	}
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
				answer_text: e.target.value
			})
		});
	};
	saveAnswer = (e) => {
		this.answerChanged(e);
		setAnswerText( this.props.auditStoreId, this.props.q.id, this.state.answer.answer_text).then((answer)=> this.setState({answer, answerError: false, answerSuccess: true}), ()=> this.setState({answerError: true, answerSuccess: false}));
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
		setMarks( this.props.auditStoreId, this.props.q.id, this.state.answer.marks_obtained).then(()=> this.setState({error: false, marksObtainedSuccess: true}), ()=> this.setState({error: true, marksObtainedSuccess: false}));
	};
	notApplicableClicked = () => {
		setAnswerNotApplicable(this.props.auditStoreId, this.props.q.id, !this.state.answer.not_applicable).then(answer => {
			this.setState({
				answer
			});
		});
	};
	render(){
		let notApplicableIcon = this.state.answer.not_applicable ? <Checked/> : <Unchecked/>;

		let notApplicableElement = (notApplicableIcon);
		let markElement = (<span><b>{this.state.answer.marks_obtained}</b>&nbsp;/&nbsp;<b>{this.props.q.max_marks}</b></span>);
		let answerElement = (
			<span>
				<big>{this.state.answer.answer_text}</big>
				{ this.props.q.question_type === "MUTEX"
					?  <AnswerComment audit_store_id={this.props.auditStoreId} question_id={this.props.q.id} editable={false} answer_comment={this.props.answer ? this.props.answer.answer_comment : ""}/>
					: null
				}
			</span>
		);
		if( this.props.marking){
			let hasError = this.state.error ? "has-error" : "";
			let hasMarksObtainedSuccess = this.state.marksObtainedSuccess ? "has-success" : "";
			markElement = (
				<div className={`input-group ${hasError} ${hasMarksObtainedSuccess}`}>
					<input className="form-control text-right"
						onChange={this.marksChanged}
						onBlur={this.saveMarks}
						value={this.state.answer.marks_obtained}/>
					<span className="input-group-addon">/&nbsp;{this.props.q.max_marks}</span>
				</div>
			);

			let hasAnswerError = this.state.answerError ? "has-error" : "";
			let hasAnswerSuccess = this.state.answerSuccess ? "has-success" : "";
			if(this.props.q.question_type === "PLAIN"){
				answerElement = (
					<div className={hasAnswerError + hasAnswerSuccess}>
						<input className="form-control"
							onChange={this.answerChanged}
							onBlur={this.saveAnswer}
							value={this.state.answer.answer_text}/>
					</div>
				);
			} else if(this.props.q.question_type === "MUTEX") {
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
							<AnswerComment audit_store_id={this.props.auditStoreId} question_id={this.props.q.id} editable={true} answer_comment={this.props.answer ? this.props.answer.answer_comment : ""}/>
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

		if( this.state.answer.not_applicable){
			markElement = (<span className="text-muted">&nbsp;</span>);
			answerElement = (<span className="text-muted">not applicable</span>);
		}

		return (
			<tr>
				<td>{this.props.q.sequence}</td>
				<td>{this.props.q.question_txt}</td>
				<td>{answerElement}</td>
				<td className="text-right">{markElement}</td>
				<td className="">{notApplicableElement}</td>
			</tr>
		);
	}
}


class SectionAttachmentBox extends React.Component{
	static propTypes = {
		sectionId: PropTypes.number,
		auditStoreId: PropTypes.number,
		auditStore: PropTypes.shape({
			status: PropTypes.string,
		}),
		editable:PropTypes.bool,
		// sections:PropTypes.array,
		proof_tags: PropTypes.array
	};

	constructor(props){
		super(props);
		this.state = {
			attachments : [],
			inProgress: {},
			selectedAttachmentId: null,
			// attachmentSectionId: "",
			submitMessage: "",
			submitStatus: "",
			showErrors: false,
			disableRotateButton: false
		};
	}

	reloadAttachments = (auditStoreId, sectionId) =>  {
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
		if(! (this.props.auditStoreId === nextProps.auditStoreId && this.props.sectionId === nextProps.sectionId)){
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

	attachmentDeleteClicked = (attachment) => {
		deleteAttachment(attachment.id).then(()=>{
			this.reloadAttachments(this.props.auditStoreId, this.props.sectionId);
		});
	};

	selectedAttachmentRenamed = (newName) => {
		renameAttachment(this.state.selectedAttachmentId, newName).then(()=>{
			this.reloadAttachments(this.props.auditStoreId, this.props.sectionId);
		});
	};

	saveAttachmentTag = (e) => {
		saveAttachmentTag(this.state.selectedAttachmentId, e.target.value).then(()=>{
			this.reloadAttachments(this.props.auditStoreId, this.props.sectionId);
		});
	};

	selectAttachment = (attachmentId) => {
		if( this.state.selectedAttachmentId === attachmentId){
			this.setState({
				selectedAttachmentId : null
			});
		} else {
			this.setState({
				selectedAttachmentId : attachmentId
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
		this.setState({disableRotateButton: true});
		rotateImageAngle(this.state.selectedAttachmentId, angle).then(()=>{
			this.reloadAttachments(this.props.auditStoreId, this.props.sectionId);
			this.setState({disableRotateButton: false});
		});
	};

	render(){
		let submitMessageElement = <big><b className={this.state.submitStatus ? "text-" + this.state.submitStatus : ""}>{this.state.submitMessage}</b></big>;

		let uploadButton;
		let editable = false;

		if(this.props.auditStore && this.props.auditStore.status === "SUBMITTED"){
			uploadButton = (<button onClick={this.uploadButtonClicked} type="button" className="btn btn-default btn-sm"><Paperclip/> Upload</button>);
			editable = true;
		}

		let attachmentRows = [];
		for(let a of this.state.attachments){
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
				onChange={this.saveAttachmentTag}
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

		// let sectionSelect = null;

		if( attachmentRows.length === 0){
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

		let selectedAttachment = this.state.attachments.filter( a => a.id === this.state.selectedAttachmentId)[0];

		return (
			<div>
				<div className="panel-body">
					<div className="col-md-8">
						<h4>Attachments {uploadButton}</h4>
						{submitMessageElement}
					</div>
					{/* {sectionSelect} */}
				</div>

				<div className={`panel-body attachment_checkbox_section${this.props.sectionId}`}>
					<div>
						{attachmentRows}
						<input type="file" multiple
							onChange={this.uploadFile}
							ref={(input)=>this.uploadInput = input}
							style={{"display":"none"}}/>
					</div>
					<AttachmentPreview attachment={selectedAttachment} editable={editable}
						proof_tags={this.props.proof_tags}
						onRename={this.selectedAttachmentRenamed}
						onDelete={() => this.attachmentDeleteClicked(selectedAttachment)}
						onChange={this.saveAttachmentTag}
						rotateImage={this.rotateImage}
						disableRotateButton={this.state.disableRotateButton}/>
				</div>
			</div>
		);
	}
}



class Section extends React.Component{
	static propTypes = {
		reportSection: PropTypes.shape({
			auditor_comment: PropTypes.string,
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
		}),
		auditStore: PropTypes.shape({
			status: PropTypes.string,
		}),
		answers: PropTypes.array,
		// sections:PropTypes.array,
		proof_tags: PropTypes.array
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

		//set initial state to true so that you don't get setState() calls
		// on an unmounted component
		not_applicable: true,
		// sections:[],
	};

	componentDidMount(){
		if(this.props.reportSection){
			this.setState({
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
	componentWillReceiveProps(nextProps){
		if(nextProps.reportSection){
			this.setState({
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
		if(this.props.reportSection && this.props.reportSection.auditor_comment === this.state.auditor_comment){
			return;
		}
		this.setState({
			savingAuditorComment: true,
			auditorCommentError: false,
			auditorCommentSuccess: false,
		});
		submitAuditorComment(this.props.auditStoreId, this.props.section.id, this.state.auditor_comment).then(()=> {
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
			this.setState({savingAuditorComment: false});
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
	render(){

		let editable = this.props.auditStore && this.props.auditStore.status === "SUBMITTED";

		/* QUESTION ROWS */
		let questionRows = [];
		if( this.props.section.questions){
			for(let q of this.props.section.questions){
				let answer = this.props.answers.filter(a => a.question === q.id)[0];
				questionRows.push(<QuestionRow q={q} key={q.id} answer={answer} marking={editable} auditStore={this.props.auditStore} auditStoreId={this.props.auditStoreId}/>);
			}
		}
		if(questionRows.length === 0){
			questionRows.push(<tr key="empty"><td colSpan="4" className="text-center text-muted">no questions here</td></tr>);
		}

		let auditorCommentElement = (<span className="text-muted">auditor comment is empty</span>);
		// let pmCommentElement = (<span className="text-muted">PM comment is empty</span>);
		let marksObtained = 0;
		let maxMarks = this.props.section.max_marks;
		let notApplicableCheckboxIcon = <Unchecked/>;
		let notApplicableElement = (<span className="">{notApplicableCheckboxIcon}</span>);

		/* AUDITOR COMMENT, PM COMMENT */
		if(this.props.reportSection){
			marksObtained = this.props.reportSection.marks_obtained;
			maxMarks = this.props.reportSection.max_marks;

			// pmCommentElement = this.state.pm_comment ? (<span>{this.state.pm_comment}</span>) : pmCommentElement;
			auditorCommentElement = this.state.auditor_comment ? (<span>{this.state.auditor_comment}</span>) : auditorCommentElement;
			notApplicableCheckboxIcon = this.state.not_applicable ? <Checked/> : <Unchecked/>;
			notApplicableElement = (<span className="">{notApplicableCheckboxIcon}</span>);
		}

		if(editable){
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
				<div className={hasAuditorCommentError + hasAuditorCommentSuccess}>
					<textarea
						disabled={this.state.savingAuditorComment}
						placeholder="enter auditor comment here"
						required="true"
						className="form-control"
						name="auditor_comment"
						value={this.state.auditor_comment}
						onBlur={this.saveAuditorComment}
						onChange={this.inputChanged}
					/>
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
		if(this.state.not_applicable){
			panelBody = (<div className="panel-footer text-center text-muted">section not applicable</div>);
		} else {
			panelBody = (<div>
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
					<hr/>
					<div><b>Auditor Comment:</b>&nbsp;{ this.state.savingAuditorComment ? "saving..." : ""} {auditorCommentElement}</div>
					{/* <hr/>
					<div><b>PM Comment:</b>&nbsp;{ this.state.savingPMComment ? "saving..." : ""} {pmCommentElement}</div> */}
				</div>
				{/* <SectionAttachmentBox auditStoreId={this.props.auditStoreId} sectionId={this.props.section.id} auditStore={this.props.auditStore} sections={this.props.sections} editable={editable} proof_tags={this.props.proof_tags}/> */}
				<SectionAttachmentBox auditStoreId={this.props.auditStoreId} sectionId={this.props.section.id} auditStore={this.props.auditStore} editable={editable} proof_tags={this.props.proof_tags}/>
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

export default class AuditStoreSections extends React.Component{
	static propTypes = {
		auditStoreId: PropTypes.number,
		auditStore: PropTypes.shape({
			status: PropTypes.string,
			audit: PropTypes.object
		}),
		children: PropTypes.node,
		editable:PropTypes.bool,
		sections:PropTypes.object
	};

	state = {
		sections: [],
		reportSections: [],
		answers: [],
		proof_tags: [],
		loading: false
	};

	componentDidMount() {
		fetchSections(this.props.auditStoreId).then((sections) => {
			this.setState({
				sections
			});
		});
		fetchAnswers(this.props.auditStoreId).then((answers) => {
			this.setState({
				answers
			});
		});
		fetchReportSections(this.props.auditStoreId).then((reportSections) => {
			this.setState({
				reportSections
			});
		});
		fetchproofTags(this.props.auditStore.audit.audit_cycle.id).then((proof_tags) => {
			this.setState({
				proof_tags
			});
		});
	}
	render(){
		//var orderedKeys = orderKeys(this.props.sections, function(s1,s2){
		//	return s1.sequence - s2.sequence;
		//});
		var sectionRows = [];
		for(var section of this.state.sections) {
			let reportSection = this.state.reportSections.filter(rs => rs.section === section.id)[0];
			sectionRows.push(<Section key={section.id}
				auditStoreId={this.props.auditStoreId}
				auditStore={this.props.auditStore}
				section={section}
				reportSection={reportSection}
				answers={this.state.answers}
				// sections={this.state.sections}
				editable = {this.props.editable}
				proof_tags={this.state.proof_tags}
			/>);
		}
		if( sectionRows.length === 0){
			sectionRows.push(<Jumbotron key="empty" heading="this questionnaire is empty" para="please add a section from the questionnaire"/>);
		}
		return (
			<div>
				<h3 className="page-header"><Tasks/> Questionnaire</h3>
				{sectionRows}
				{this.props.children}
			</div>
		);
	}
}

