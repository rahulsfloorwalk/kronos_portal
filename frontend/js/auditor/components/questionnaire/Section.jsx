import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { } from "react-router";

import SectionAttachmentBox from "./SectionAttachmentBox.jsx";
import QuestionRow from "./QuestionRow.jsx";

import { affectInputEventToComponent } from "../../../react_utils.js";

import { submitAuditorComment } from "../../actions/report_section.js";

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
	};
	constructor(props){
		super(props);
		this.state = {
			auditor_comment: "",
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
			});
			return;
		}
		this.setState({
			saving: true,
			focused: false,
		});
		var payload = {
			sectionId: this.props.section.id,
			auditor_comment: this.state.auditor_comment,
			audit_store: this.props.auditStoreId,
		};
		this.props.dispatch(submitAuditorComment(payload)).then(() => this.setState({saving: false}));
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

		let commentElement = (<p>{auditor_comment}</p>);
		if(this.props.auditStore && this.props.auditStore.status === "ACKNOWLEDGED"){
			commentElement = (
				<form onSubmit={this.submitComment}>
					<input
						className="form-control"
						name="auditor_comment"
						value={this.state.auditor_comment}
						onFocus={this.onFocus}
						onBlur={this.submitComment}
						onChange={this.inputChanged}
						ref={(input) => this.commentInput = input}
						placeholder="type out your relevant experience here in a few sentences"
					/>
				</form>
			);
		}

		if(this.state.saving){
			var savingMessage = (<span className="text-warning">&nbsp;&nbsp;&nbsp;saving...</span>);
		}

		let goodClass = this.state.focused || this.state.saving || !this.state.auditor_comment || (this.state.auditor_comment).length < 20 ? "" : "success";
		let badClass = this.props.showErrors && (this.state.auditor_comment).length< 20 ? "danger" : "";
		
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
										<p><b>Section Summary:</b> {savingMessage}</p>
										{commentElement}
									</div>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
				<SectionAttachmentBox
					auditStoreId={this.props.auditStoreId}
					auditStore={this.props.auditStore}
					sectionId={this.props.section.id}
					minimumAttachmentCount={this.props.section.minimum_attachment_count}
					showErrors={this.props.showErrors}
				/>
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
