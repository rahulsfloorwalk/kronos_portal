import React from "react";
import PropTypes from "prop-types";

import Panel from "../../../components/Panel.jsx";

import { getColor } from "../../../utils.js";

import QuestionRow from "./QuestionRow.jsx";
import SectionAttachmentBox from "./SectionAttachmentBox.jsx";

export default class Section extends React.Component {
	static propTypes = {
		auditStoreId: PropTypes.number.isRequired,
		auditStore: PropTypes.shape({
			id: PropTypes.number.isRequired,
		}),
		section: PropTypes.shape({
			id: PropTypes.number.isRequired,
			max_marks: PropTypes.number,
			sequence: PropTypes.number,
			name: PropTypes.string,
			questions: PropTypes.arrayOf(PropTypes.shape({
			})),
		}),
		answers: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
		})),
		reportSection: PropTypes.shape({
			id: PropTypes.number.isRequired,
			auditor_comment: PropTypes.string,
			pm_comment: PropTypes.string,
			not_applicable: PropTypes.bool,
			color_code: PropTypes.number,
			marks_obtained: PropTypes.number,
			max_marks: PropTypes.number,
		}),
		printMode: PropTypes.bool,
	};

	static defaultProps = {
		printMode:false,
	};

	render() {
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
			let comment_code = null;			
			if(this.props.reportSection.pm_comment == "--"){
				comment_code = (
					<p><b>Section Summary:</b> {auditor_comment}</p>
				);
			}
			else{
				let margin_style = {
					marginLeft: "2%"
				};
				let fontstyle={
					fontSize: "16px"
				};
				comment_code = (
					<div>
					<p style={fontstyle}><b>Section Summary:</b></p>
					<div style={margin_style}>
						<p><b>Auditor Comment:</b> {auditor_comment}</p>
						{/* <hr/> */}
						<p><b>PM Comment:</b> {pm_comment}</p>
						</div>
					</div>
				);
			}
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
						{comment_code}
						{/* <p><b>Section Summary:</b> {auditor_comment}</p> */}
						{/* <hr/>
						<p><b>PM Comment:</b> {pm_comment}</p> */}
					</div>
					{ this.props.printMode ? null
						: <SectionAttachmentBox auditStoreId={this.props.auditStoreId} sectionId={this.props.section.id} auditStore={this.props.auditStore}/> }
				</div>
			);
		}

		return (
			<Panel type={classes} title={`${this.props.section.sequence} - ${this.props.section.name}`} noBody={true}>
				{panelBody}
			</Panel>
		);
	}
}
