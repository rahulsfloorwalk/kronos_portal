import $ from "jquery";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import Alert from "react-s-alert";

import Jumbotron from "../../components/Jumbotron.jsx";
import { Tasks, Checked, Unchecked, Paperclip } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";

import { findAttachmentsByAuditStoreAndSection, uploadFileForReportSection, deleteAttachment, renameAttachment, moveAttachmentToSection, rotateImageAngle } from "../service/attachment.js";
import { affectInputEventToComponent, orderKeys } from "../../react_utils.js";
import { fetchSections } from "../actions/section.js";
import { fetchAnswers, setMarks, setAnswerNotApplicable } from "../actions/answer.js";
import { setAnswerText, setAnswerComment } from "../service/answer.js";
import { submitAuditorComment, fetchReportSections, setNotApplicable } from "../actions/report_section.js";
import AttachmentPreview from "./AttachmentPreview.jsx";

import AttachmentThumbnail from "../../components/AttachmentThumbnail.jsx";
import AttachmentInProgressThumbnail from "../../components/AttachmentInProgressThumbnail.jsx";

import { auditStorePropType, sectionPropType } from "../prop_types";
import { fetchproofTags, saveAttachmentTag } from "../service/proof_tag.js";

class AnswerComment extends Component {
	static propTypes = {
		answer_comment: PropTypes.string,
		audit_store_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		question_id: PropTypes.number,
		editable: PropTypes.bool,
	};
	constructor(props){
		super(props);
		this.state = {
			answer_comment: this.props.answer_comment || "",
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

class __QuestionRow extends React.Component {
	static propTypes = {
		answer: PropTypes.shape({
			answer_comment: PropTypes.string,
			get_answer_text_list: PropTypes.oneOf[PropTypes.array, PropTypes.string]
		}),
		auditStoreId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
		q: PropTypes.shape({
			id: PropTypes.number.isRequired,
			sequence: PropTypes.number.isRequired,
			max_marks: PropTypes.number.isRequired,
			question_type: PropTypes.string.isRequired,
			question_txt: PropTypes.string.isRequired,
			question_data: PropTypes.shape({
				options: PropTypes.arrayOf(PropTypes.shape({
				})),
			}),
		}),
		dispatch: PropTypes.func.isRequired,
		marking: PropTypes.bool,
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

	componentDidMount() {
		if(this.props.answer){
			this.setState({
				answer: this.props.answer
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.answer){
			this.setState({
				answer: nextProps.answer
			});
		}
	}

	answerChanged = (e) => {
		this.setState({
			answer: Object.assign({}, this.state.answer, {
				answer_text: e.target.value
			})
		});
	};

	saveAnswer = (e) => {
		this.answerChanged(e);
		setAnswerText(
			this.props.auditStoreId,
			this.props.q.id,
			this.state.answer.answer_text,
			true
		).then((a)=> this.setState({answer: a, answerError: false, answerSuccess: true}), ()=> this.setState({answerError: true, answerSuccess: false}));
	};

	submitMultiSelectAnswer = (e) => {
		setAnswerText(this.props.auditStoreId, this.props.q.id, e.target.value, e.target.checked).then((answer) => this.setState({answer, answerError: false, answerSuccess: true}));
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
		this.props.dispatch(setMarks({
			auditStoreId: this.props.auditStoreId,
			questionId: this.props.q.id,
			marks: this.state.answer.marks_obtained,
		})).then(()=> this.setState({error: false, marksObtainedSuccess: true}), ()=> this.setState({error: true, marksObtainedSuccess: false}));
	};

	notApplicableClicked = () => {
		this.props.dispatch(setAnswerNotApplicable(this.props.auditStoreId, this.props.q.id, !this.state.answer.not_applicable));
	};

	render() {
		let markElement = (<span><b>{this.state.answer.marks_obtained}</b>&nbsp;/&nbsp;<b>{this.props.q.max_marks}</b></span>);
		let answerElement = (
			<span>
				<big>{this.state.answer.answer_text}</big>
				{ this.props.q.question_type === "MUTEX" || this.props.q.question_type === "MULTISELECT"
					?  <AnswerComment audit_store_id={this.props.auditStoreId} question_id={this.props.q.id} editable={false} answer_comment={this.props.answer ? this.props.answer.answer_comment : ""}/>
					: null
				}
			</span>
		);

		let notApplicableIcon = this.state.answer.not_applicable ? <Checked/> : <Unchecked/>;

		let notApplicableElement = (notApplicableIcon);

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
			} else if(this.props.q.question_type === "MULTISELECT") {
				let checkbox_list = [];
				let multiselect_answer_list = [];
				if(this.props.answer){
					multiselect_answer_list = this.props.answer.get_answer_text_list;
				}
				for(let o of this.props.q.question_data.options){
					if(multiselect_answer_list.includes(o.value)){
						checkbox_list.push(<label style={{fontSize:"14px",marginBottom:"10px"}} key={o.sequence}><input type="checkbox" value={o.value} name="answer_text" onClick={this.submitMultiSelectAnswer} defaultChecked style={{verticalAlign:"bottom",width:"20px",height:"20px"}} /><span> {o.value}</span>&nbsp;</label>);
					}
					else{
						checkbox_list.push(<label style={{fontSize:"14px",marginBottom:"10px"}} key={o.sequence}><input type="checkbox" value={o.value} name="answer_text" onClick={this.submitMultiSelectAnswer} style={{verticalAlign:"bottom",width:"20px",height:"20px"}} /><span> {o.value}</span>&nbsp;</label>);
					}
				}
				answerElement = (
					<div className="row">
						<div className="col-xs-5">
							{checkbox_list}
							<br/>
							{this.state.answer.answer_text}
						</div>
						<div className="col-xs-7">
							<AnswerComment audit_store_id={this.props.auditStoreId} question_id={this.props.q.id} answer_comment={this.props.answer ? this.props.answer.answer_comment : ""} editable={true}/>
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

var mapStoreToQuestionRowProps = function(store, ownProps){
	return {
		answer: (function(answers){
			for(let id in answers){
				if(answers[id].question === ownProps.q.id && answers[id].audit_store === parseInt(ownProps.auditStoreId)){
					return answers[id];
				}
			}
		})(store.answers)
	};
};

var QuestionRow = connect(mapStoreToQuestionRowProps)(__QuestionRow);

class SectionAttachmentBox extends React.Component{

	static propTypes = {
		editable: PropTypes.bool.isRequired,
		auditStoreId: PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.string,
		]).isRequired,
		sectionId: PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.string,
		]).isRequired,
		auditStore: PropTypes.object.isRequired,
		// sections:PropTypes.object,
		proof_tags: PropTypes.array
	};

	constructor(props){
		super(props);
		this.state = {
			attachments : [],
			inProgress: {},
			selectedAttachmentId: null,
			attachmentSectionId: "",
			submitMessage: "",
			submitStatus: "",
			showErrors: false,
			disableRotateButton: false,
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
			Alert.success("PROOF TAG SAVED");
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

	getAttachmentSectionId = (e) => {
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
	};

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

		if(this.props.editable) {
			uploadButton = (<button onClick={this.uploadButtonClicked} type="button" className="btn btn-default btn-sm"><Paperclip/> Upload</button>);
		}

		let attachmentRows = [];
		for(let a of this.state.attachments){
			attachmentRows.push(
				<AttachmentThumbnail key={a.id} attachment={a} deletable={this.props.editable} onSelect={() => this.selectAttachment(a.id)} onDelete={() => this.attachmentDeleteClicked(a)} selected={a.id === this.state.selectedAttachmentId} user="manager" editable={this.props.editable} faulty_report_id={a.faulty_report_id} proof_tags={this.props.proof_tags} section_id={this.props.sectionId} onChange={this.saveAttachmentTag}/>
			);
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

		/*var orderedKeys = orderKeys(this.props.sections, function(s1,s2){
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

		let sectionSelect = null;*/

		if( attachmentRows.length === 0){
			attachmentRows.push(<span key="empty" className="text-muted">no attachments here&nbsp;</span>);
		}
		/*else{
			if(this.props.editable){
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
					<AttachmentPreview attachment={selectedAttachment} editable={this.props.editable}
						proof_tags={this.props.proof_tags}
						onRename={this.selectedAttachmentRenamed}
						onDelete={() => this.attachmentDeleteClicked(selectedAttachment)}
						onChange={this.saveAttachmentTag}
						rotateImage={this.rotateImage}
						section_id={this.props.sectionId}
						disableRotateButton={this.state.disableRotateButton}/>
				</div>
			</div>
		);
	}
}

class __Section extends React.Component{

	static propTypes = {
		editable: PropTypes.bool.isRequired,
		section: sectionPropType,
		reportSection: PropTypes.shape({
			auditor_comment: PropTypes.string,
			pm_comment: PropTypes.string,
			not_applicable: PropTypes.bool,
			marks_obtained: PropTypes.number,
			max_marks: PropTypes.number.isRequired,
		}),
		dispatch: PropTypes.func.isRequired,
		auditStoreId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
		auditStore: auditStorePropType,

		params: PropTypes.shape({
			auditStoreId: PropTypes.string.isRequired,
		}),
		// sections:PropTypes.object,
		proof_tags: PropTypes.array
	};

	constructor(props){
		super(props);
		this.state = {
			//pmCommentError: false,
			auditorCommentError: false,

			pmCommentSuccess: false,
			auditorCommentSuccess: false,

			//savingPMComment: false,
			savingAuditorComment: false,

			auditor_comment: "",
			pm_comment: "",

			//set initial state to true so that you don't get setState() calls
			// on an unmounted component
			not_applicable: true,
		};
	}

	componentDidMount(){
		if(this.props.reportSection){
			this.setState({
				auditor_comment: this.props.reportSection.auditor_comment,
				pm_comment: this.props.reportSection.pm_comment,
				not_applicable: this.props.reportSection.not_applicable,
			});
		}
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.reportSection){
			this.setState({
				auditor_comment: nextProps.reportSection.auditor_comment,
				pm_comment: nextProps.reportSection.pm_comment,
				not_applicable: nextProps.reportSection.not_applicable,
			});
		}
	}

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	saveAuditorComment = (e) => {
		e.preventDefault();
		this.setState({
			savingAuditorComment: true,
			auditorCommentError: false,
			auditorCommentSuccess: false,
		});
		this.props.dispatch(submitAuditorComment(this.props.auditStoreId, this.props.section.id, this.state.auditor_comment)).then(()=> {
			this.setState({
				auditorCommentError: false,
				auditorCommentSuccess: true,
			});
		}, () => {
			this.setState({
				auditorCommentSuccess: false,
				auditorCommentError: true,
			});
		}).always(() => {
			this.setState({savingAuditorComment: false});
		});
	};

	/* savePMComment = (e) => {
		e.preventDefault();
		this.setState({
			savingPMComment: true,
		});
		var payload = {
			sectionId: this.props.section.id,
			pm_comment: this.state.pm_comment,
			audit_store: this.props.auditStoreId,
		};
		this.props.dispatch(submitPMComment(payload)).then(()=> {
			this.setState({
				pmCommentSuccess: true,
				pmCommentError: false,
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
		this.props.dispatch(setNotApplicable(this.props.auditStoreId, this.props.section.id, !this.state.not_applicable));
	};

	render(){
		/* QUESTION ROWS */
		let questionRows = [];
		if( this.props.section.questions){
			for(let q of this.props.section.questions){
				questionRows.push(<QuestionRow q={q} key={q.id} marking={this.props.editable} auditStoreId={this.props.auditStoreId}/>);
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

			//pmCommentElement = this.state.pm_comment ? (<span>{this.state.pm_comment}</span>) : pmCommentElement;
			auditorCommentElement = this.state.auditor_comment ? (<span>{this.state.auditor_comment}</span>) : auditorCommentElement;
			notApplicableCheckboxIcon = this.props.reportSection.not_applicable ? <Checked/> : <Unchecked/>;
			notApplicableElement = (<span className="">{notApplicableCheckboxIcon}</span>);

			var pmCommentElement = null;
			if(this.state.pm_comment != "--"){
				pmCommentElement = (<div><hr/><div><b>PM Comment:</b> <span>{this.state.pm_comment}</span></div></div>);
			}
		}

		if(this.props.editable){
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

		if( this.state.not_applicable){
			panelBody = (<div className="panel-footer text-center text-muted">section not applicable</div>);
		} else {
			panelBody = ( <div>
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
					<div>
						<b>Total Marks:</b> {marksObtained} out of {maxMarks}
					</div>
					<hr/>
					<div><b>Auditor Comment:</b> {auditorCommentElement}</div>
					{/* <hr/>
					<div><b>PM Comment:</b> {pmCommentElement}</div> */}
					{pmCommentElement}
				</div>
				<SectionAttachmentBox auditStoreId={this.props.auditStoreId} sectionId={this.props.section.id} auditStore={this.props.auditStore} editable={this.props.editable} proof_tags={this.props.proof_tags}/>
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

var mapStoreToSectionProps = function(store, ownProps){
	return {
		reportSection: (function(reportSections){
			for(let id in reportSections){
				if(reportSections[id].section === ownProps.section.id){
					return reportSections[id];
				}
			}
		})(store.reportSections),
		auditStore: store.auditStores[ownProps.auditStoreId]
	};
};

var Section = connect(mapStoreToSectionProps)(__Section);

export class AuditStoreReport extends React.Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditStoreId: PropTypes.string,
		}),
		auditStore: auditStorePropType,
		sections: PropTypes.object,
		children: PropTypes.node,
	};
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			proof_tags: []
		};
	}

	componentDidMount() {
		this.props.dispatch(fetchAnswers(this.props.params.auditStoreId));
		this.props.dispatch(fetchReportSections(this.props.params.auditStoreId));
		if( this.props.auditStore && ! this.state.loading){
			this.setState({
				loading: true
			});
			this.props.dispatch(fetchSections(this.props.auditStore.audit.audit_cycle.id));
			fetchproofTags(this.props.auditStore.audit.audit_cycle.id).then((proof_tags) => {
				this.setState({
					proof_tags,
					loading: false
				});
			});
		}
	}

	componentWillReceiveProps( nextProps){
		if( nextProps.auditStore && ! this.state.loading ){
			this.setState({
				loading: true
			});
			this.props.dispatch(fetchSections(nextProps.auditStore.audit.audit_cycle.id)).always(() => this.setState({loading: false}));
		}
	}

	render(){
		if(this.state.loading){
			return <Loading/>;
		}
		const editable = this.props.auditStore && (this.props.auditStore.status === "SUBMITTED" || this.props.auditStore.status === "PM_REVIEW");
		var orderedKeys = orderKeys(this.props.sections, function(s1,s2){
			return s1.sequence - s2.sequence;
		});
		var sectionRows = [];
		for(var sectionId of orderedKeys) {
			// sectionRows.push(<Section auditStoreId={this.props.params.auditStoreId} section={this.props.sections[sectionId]} key={sectionId} editable={editable} sections={this.props.sections} proof_tags={this.state.proof_tags}/>);
			sectionRows.push(<Section auditStoreId={this.props.params.auditStoreId} section={this.props.sections[sectionId]} key={sectionId} editable={editable} proof_tags={this.state.proof_tags}/>);
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

var mapStoreToProps = function(store, ownProps){
	return {
		auditStore: store.auditStores[ownProps.params.auditStoreId],
		sections: store.sections
	};
};

export default connect(mapStoreToProps)(AuditStoreReport);
