import React from 'react';
import { Link } from 'react-router';

import { truncateStyle } from '../../js/styles.js';
import { getColor } from '../../js/utils.js';

import Jumbotron from '../../js/components/Jumbotron.jsx';
import Panel from '../../js/components/Panel.jsx';
import { Paperclip, Tasks, Plus, Cross, Pencil } from '../../js/components/Icons.jsx';

import AttachmentDisplayBox from './AttachmentDisplayBox.jsx';

import AttachmentProofIcon from '../../js/components/AttachmentProofIcon.jsx';
import AttachmentPreview from '../../js/components/manager/AttachmentPreview.jsx';

import { fetchAnswers } from '../service/answer.js';
import { findAttachmentsByAuditStoreAndSection } from '../service/attachment.js';

var QuestionRow = React.createClass({
	render: function(){
		let maxMarks, answerMarks, answerText;
		if(this.props.showMarks){
			maxMarks = this.props.q.max_marks;
		}
		if(this.props.answer){
			if( this.props.answer.not_applicable){
				answerMarks = "";
				maxMarks = "";
				answerText = (<span className="text-muted">not applicable</span>);
			} else {
				answerText = this.props.answer.answer_text;
				if( this.props.showMarks){
					answerMarks = this.props.answer.marks_obtained;
				}
			}
		}
		return (
			<tr>
				<td>{this.props.q.sequence}</td>
				<td>{this.props.q.question_txt}</td>
				<td>{answerText}</td>
				<td>{answerMarks}</td>
				<td>{maxMarks}</td>
				<td>
				</td>
			</tr>
		);
	},
});

class SectionAttachmentBox extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			attachments : [],
			selectedAttachmentId: null,
		}
	}

	reloadAttachments = (auditStoreId, sectionId) =>  {
		findAttachmentsByAuditStoreAndSection(auditStoreId, sectionId).then((attachments) => {
			this.setState({
				attachments
			});
		});
	}

	componentDidMount(){
		this.reloadAttachments(this.props.auditStoreId, this.props.sectionId);
	}

	componentWillReceiveProps(nextProps){
		this.reloadAttachments(nextProps.auditStoreId, nextProps.sectionId);
	}

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
	}

	render(){
		let editable = false;

		let itemStyle = Object.assign({}, truncateStyle, { maxWidth: "200px", });

		let attachmentRows = [];
		for(let a of this.state.attachments){
			let activeClass = a.id === this.state.selectedAttachmentId ? "active" : "";
			attachmentRows.push(
				<span key={a.id} className="btn-group btn-group-sm">
					<button className={"btn btn-default btn-sm " + activeClass} title={a.file_name + " - Click to preview file"} style={itemStyle} onClick={() => this.selectAttachment(a.id)}>
					<AttachmentProofIcon proofType={a.proof_type}/>&nbsp;
					{a.file_name}
					</button>
				</span>
			);
			attachmentRows.push(" ");
		}

		if( attachmentRows.length === 0){
			return null;
		}

		let selectedAttachment = this.state.attachments.filter( a => a.id === this.state.selectedAttachmentId)[0];

		if(this.props.printMode){
			return (
				<div className="panel-body">
					<div className="col-xs-offset-1 col-xs-10">
						{this.state.attachments.filter(a=>a.proof_type === "PHOTO").map( a => <AttachmentPreview attachment={a} editable={false}/>)}
					</div>
				</div>
			);
		} else {
			return (
				<div className="panel-body">
					<div className="hidden-print">
						<b>Attachments:</b> {attachmentRows}
						<input type="file" multiple
							onChange={this.uploadFile}
							ref={(input)=>this.uploadInput = input}
							style={{"display":"none"}}/>
					</div>
					<div className="hidden-print">
						<AttachmentPreview attachment={selectedAttachment} editable={editable}/>
					</div>
				</div>
			);
		}
	}
}

var Section = React.createClass({
	getDefaultProps: function(){
		return {
			printMode:false,
		};
	},
	render: function(){
		let questionRows = [];
		if( this.props.section.questions){
			for(let q of this.props.section.questions){
				let answer = this.props.answers.filter((a) => a.question === q.id)[0];
				questionRows.push(<QuestionRow q={q} key={q.id} answer={answer} showMarks={this.props.section.max_marks > 0}/>);
			}
		}
		if(questionRows.length === 0){
			questionRows.push(<tr key="empty"><td colSpan="5" className="text-center text-muted">no questions here</td></tr>);
		}

		let notApplicable = false;
		let maxMarks = this.props.section.max_marks;
		let marksObtained = 0;

		if(this.props.reportSection){
			var classes = "default";
			var auditor_comment = this.props.reportSection.auditor_comment;
			var pm_comment = this.props.reportSection.pm_comment;
			marksObtained = this.props.reportSection.marks_obtained;
			maxMarks = this.props.reportSection.max_marks;
			notApplicable = this.props.reportSection.not_applicable;

			if( ! notApplicable) {
				classes = getColor(this.props.reportSection.color_code);
			}
		}
		var styles = {
			col1: { width: "5%" },
			col2: { width: "40%" },
			col3: { width: "40%" },
			col4: { width: "7.5%" },
			col5: { width: "7.5%" },
		};

		if( this.props.section.max_marks > 0){
			var totalMarks = (<div><b>Total Marks:</b> {marksObtained} out of {maxMarks}<hr/></div>);
			var marksHeading = "Marks";
			var maxMarksHeading = "Max. Marks";
		}

		let panelBody;
		if(notApplicable){
			panelBody = (<div className="panel-footer text-center text-muted">section not applicable</div>);
		} else {
			panelBody = (
				<div>
				<table className="table table-striped">
					<thead>
						<tr>
							<th style={styles.col1}>#</th>
							<th style={styles.col2}>Question</th>
							<th style={styles.col3}>Answer</th>
							<th style={styles.col4}>{marksHeading}</th>
							<th style={styles.col5}>{maxMarksHeading}</th>
						</tr>
					</thead>
					<tbody>
						{questionRows}
					</tbody>
				</table>
				<div className="panel-footer">
					{totalMarks}
					<p><b>Auditor Comment:</b> {auditor_comment}</p>
					<hr/>
					<p><b>PM Comment:</b> {pm_comment}</p>
				</div>
				<SectionAttachmentBox auditStoreId={this.props.auditStoreId} sectionId={this.props.section.id} auditStore={this.props.auditStore} printMode={this.props.printMode}/>
				</div>
			);
		}

		return (
			<Panel type={classes} title={`${this.props.section.sequence} - ${this.props.section.name}`} noBody={true}>
				{panelBody}
			</Panel>
		);
	},
});

export default React.createClass({
	getInitialState: function(){
		return {
			answers: []
		};
	},
	getDefaultProps: function(){
		return {
			printMode: false,
		};
	},
	componentDidMount: function() {
		fetchAnswers(this.props.auditStoreId).then((answers) => {
			this.setState({
				answers
			});
		});
	},
	render: function(){
		var sectionRows = [];
		for(var s of this.props.sections) {
			let reportSection = this.props.reportSections.filter((rs) => rs.section === s.id)[0];
			sectionRows.push(<Section auditStoreId={this.props.auditStoreId} section={s} answers={this.state.answers} reportSection={reportSection} key={s.id} printMode={this.props.printMode}/>);
		}
		if( sectionRows.length === 0){
			sectionRows.push(<Jumbotron key="empty" heading="this questionnaire is empty" para="contact site administrator"/>);
		}
		return (
			<div>
				<h3 className="page-header">
					<Paperclip/> Attachments
				</h3>
				<AttachmentDisplayBox auditStoreId={this.props.auditStoreId} printMode={this.props.printMode}/>
				<h3 className="page-header">
					<Tasks/> Questionnaire
				</h3>
				{sectionRows}
				{this.props.children}
			</div>
		);
	},
});

