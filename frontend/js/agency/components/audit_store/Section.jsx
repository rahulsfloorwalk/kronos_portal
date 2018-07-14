import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { } from "react-router";

import SectionAttachmentBox from "./SectionAttachmentBox.jsx";
import QuestionRow from "./QuestionRow.jsx";
import AuditorComment from "./AuditorComment.jsx";

import { auditStorePropType } from "../../prop_types.js";

export class __Section extends React.Component{
	static propTypes = {
		section: PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			sequence: PropTypes.number.isRequired,
			questions: PropTypes.arrayOf(PropTypes.shape({
				id: PropTypes.number.isRequired,
				sequence: PropTypes.number.isRequired,
				question_txt: PropTypes.string.isRequired,
				question_type: PropTypes.string.isRequired,
			})),
		}),

		auditStore: auditStorePropType,
		showErrors: PropTypes.bool,
		auditorComment: PropTypes.string,
	};

	state = {};

	render(){
		if(this.props.auditStore && this.props.section){
			const questionRows = [];
			if( this.props.section.questions){
				for(let q of this.props.section.questions){
					questionRows.push(<QuestionRow auditStoreId={this.props.auditStore.id} question={q} key={q.id} showErrors={this.props.showErrors}/>);
				}
			}
			if(questionRows.length === 0){
				questionRows.push(<tr key="empty"><td className="text-center text-muted">no questions here</td></tr>);
			}

			const goodClass = this.props.auditorComment ? "success" : "";
			const badClass = this.props.showErrors && !this.props.auditorComment ? "danger" : "";

			return (
				<div className="panel panel-default">
					<div className="panel-heading">
						<h4 className="panel-title">
							{this.props.section.sequence} - <b>{this.props.section.name}</b>
						</h4>
					</div>
					<table className="table table-striped">
						<thead>
							<tr>
								<th>
									<div className="row">
										<div className="col-xs-1 text-right">#</div>
										<div className="col-xs-10 col-md-5">Question</div>
										<div className="col-xs-12 col-md-6 hidden-xs hidden-sm">Answer</div>
									</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{questionRows}
							<tr className={goodClass || badClass}>
								<td>
									<div className="row">
										<div className="col-xs-offset-1 col-md-11">
											<AuditorComment auditStoreId={this.props.auditStore.id} sectionId={this.props.section.id}/>
										</div>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
					<SectionAttachmentBox auditStoreId={this.props.auditStore.id} sectionId={this.props.section.id} auditStore={this.props.auditStore}/>
				</div>
			);
		} else {
			return null;
		}
	}
}

const findAuditStore = (store, auditStoreId) => {
	return store.auditStores.find((as) => as.id === auditStoreId);
};

const findSection = (store, sectionId) => {
	return store.sections.find((s) => s.id === sectionId);
};

const findReportSection = (store, auditStoreId, sectionId) => {
	return store.reportSections.find((rs) => rs.audit_store_id === auditStoreId && rs.section_id === sectionId);
};

const mapStateToProps = (store, ownProps) => {
	const reportSection = findReportSection(store, ownProps.auditStoreId, ownProps.sectionId);
	return {
		auditStore: findAuditStore( store, ownProps.auditStoreId),
		section: findSection(store, ownProps.sectionId),
		showErrors: ownProps.showErrors,
		auditorComment: reportSection && reportSection.auditor_comment,
	};
};

export default connect(mapStateToProps)(__Section);
