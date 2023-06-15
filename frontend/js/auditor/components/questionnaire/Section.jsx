import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { } from "react-router";

import Alert from "react-s-alert";

import SectionAttachmentBox from "./SectionAttachmentBox.jsx";
import QuestionRow from "./QuestionRow.jsx";
import { GrammarlyEditorPlugin} from "@grammarly/editor-sdk-react";

import { ClientID } from "../../../constants.js";
import { affectInputEventToComponent } from "../../../react_utils.js";

import { submitAuditorComment } from "../../actions/report_section.js";
import "../../../../css/bs_overrides.scss";
class __Section extends React.Component{

	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		auditStoreId: PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.string,
		]).isRequired,
		showErrors: PropTypes.bool.isRequired,
		section: PropTypes.object.isRequired,

		auditStore: PropTypes.object,
		reportSection: PropTypes.object,

		editable:PropTypes.bool,
		// sections:PropTypes.object,
		proof_tags: PropTypes.array,
	};
	constructor(props){
		super(props);
		this.state = {
			auditor_comment: "",
			auditor_comment_error: "",
			focused: false,
		};
	}

	componentDidMount(){
		if(this.props.reportSection){
			this.setState({
				auditor_comment: this.props.reportSection.auditor_comment
			});
		}
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.reportSection){
			this.setState({
				auditor_comment: nextProps.reportSection.auditor_comment
			});
		}
	}

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onFocus = () => {
		this.setState({
			focused: true,
		});
	};

	submitComment = (e) => {
		e.preventDefault();
		if(this.props.reportSection && this.props.reportSection.auditor_comment === this.state.auditor_comment){
			this.setState({
				focused: false,
				auditor_comment_error: "",
			});
			return;
		}
		this.setState({
			saving: true,
			focused: false,
			auditor_comment_error: "",
		});
		var payload = {
			sectionId: this.props.section.id,
			auditor_comment: this.state.auditor_comment,
			audit_store: this.props.auditStoreId,
		};
		this.props.dispatch(submitAuditorComment(payload)).then(() => this.setState({saving: false})).fail((err) => {
			let error = err.responseJSON.non_field_errors;
			this.setState({saving: false, auditor_comment_error: error ? error : ""});
		});
		Alert.success("Data Saved");
	};

	render(){
		let questionRows = [];
		if( this.props.section.questions){
			for(let q of this.props.section.questions){
				questionRows.push(<QuestionRow auditStoreId={this.props.auditStoreId} q={q} key={q.id} showErrors={this.props.showErrors}/>);
			}
		}
		if(questionRows.length === 0){
			questionRows.push(<tr key="empty"><td className="text-center text-muted">no questions here</td></tr>);
		}

		let auditor_comment = this.state.auditor_comment || (<span className="text-muted">-</span>);

		let commentElement = (<p className="report-scroll">{auditor_comment}</p>);
		let section_attachment_box_element;
		if(this.props.auditStore && this.props.auditStore.status === "ACKNOWLEDGED"){
			if(this.props.section.hide_comment == false){
				commentElement = (
					<form onSubmit={this.submitComment}>
						<GrammarlyEditorPlugin clientId={ClientID}>
							<textarea
								rows="3"
								maxLength="4096"
								className="form-control"
								name="auditor_comment"
								value={this.state.auditor_comment}
								onFocus={this.onFocus}
								onBlur={this.submitComment}
								onChange={this.inputChanged}
								ref={(input) => this.commentInput = input}
								placeholder="type out your relevant experience here in a few sentences"
							/>
						</GrammarlyEditorPlugin>
					</form>
				);
			}
		}
		else{
			section_attachment_box_element = <SectionAttachmentBox
				auditStoreId={this.props.auditStoreId}
				auditStore={this.props.auditStore}
				sectionId={this.props.section.id}
				minimumAttachmentCount={this.props.section.minimum_attachment_count}
				showErrors={this.props.showErrors}
				// sections={this.props.sections}
				editable={this.props.editable}
				proof_tags={this.props.proof_tags}
			/>;
		}

		if(this.state.saving){
			var savingMessage = (<span className="text-warning">&nbsp;&nbsp;&nbsp;saving...</span>);
		}

		let goodClass = this.state.focused || this.state.saving || !this.state.auditor_comment || (this.state.auditor_comment).length < 150 ? "" : "success";
		let badClass = (this.props.showErrors || this.state.auditor_comment_error) && (this.state.auditor_comment).length < 150 ? "danger" : "";

		return (
			<div className="panel panel-default report-scroll">
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
						{ this.props.section.hide_comment == false ?
							<tr className={goodClass || badClass}>
								<td>
									<div className="row">
										<div className="col-xs-offset-1 col-md-11">
											<p><b>Section Summary:</b> <small className="text-danger"> {this.state.auditor_comment_error ? this.state.auditor_comment_error : "(Min 150 characters in length)"}</small> {savingMessage}</p>
											{commentElement}
										</div>
										{this.props.auditStore && this.props.auditStore.status === "ACKNOWLEDGED" && this.props.reportSection && this.props.reportSection.revert_message ? <div className="col-xs-12 col-xs-offset-1 col-md-12 col-md-offset-1" style={{marginTop:"9px"}}>
											<p className="text-danger"><b>Revert message: </b>{this.props.reportSection.revert_message}</p>
										</div> : null}
									</div>
								</td>
							</tr>
							: null}
					</tbody>
				</table>
				{section_attachment_box_element}
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

export default connect(mapStoreToSectionProps)(__Section);
