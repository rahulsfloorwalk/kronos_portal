import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import Alert from "react-s-alert";

import { CSSTransitionGroup } from "react-transition-group";

import { pointerStyle } from "../../../styles.js";

import { Plus, Cross, Pencil, ChevronRight, ChevronDown } from "../../../components/Icons.jsx";

import { deleteQuestion } from "../../service/question.js";
import QuestionRow from "./QuestionRow.jsx";
import { sectionPropType } from "./prop_types";


export default class Section extends React.Component {
	static propTypes = {
		section: sectionPropType.isRequired,
		auditCycleId: PropTypes.string.isRequired,
		onChange: PropTypes.func.isRequired,
		onDelete: PropTypes.func.isRequired,
	};

	state = {
		expanded: false,
	};

	toggleExpanded = () => {
		this.setState({
			expanded: !this.state.expanded,
		});
	};

	onQuestionDelete = (question) => {
		deleteQuestion(question.id).then(() => {
			this.props.onChange && this.props.onChange();
			Alert.success("QUESTION DELETED");
		}, () => {
			Alert.warning("QUESTION CANNOT BE DELETED");
		});
	};

	render() {
		let questionRows = [];
		if( this.props.section.questions){
			for(let q of this.props.section.questions){
				questionRows.push(<QuestionRow auditCycleId={this.props.auditCycleId} q={q} key={q.id} onDelete={this.onQuestionDelete}/>);
			}
		}
		if(questionRows.length === 0){
			questionRows.push(<tr key="empty"><td colSpan="5" className="text-center text-muted">no questions here</td></tr>);
		}
		questionRows.push(
			<tr key="new">
				<td colSpan={5} className="text-center">
					<Link to={`/audit_cycle/${this.props.auditCycleId}/questionnaire/section/${this.props.section.id}/question/add`} className="btn btn-default">
						<Plus/> Add Question
					</Link>
				</td>
			</tr>
		);

		let expandIcon = (<ChevronRight/>);
		let panelBody = null;//(<div className="panel-footer text-center text-muted"><button onClick={this.toggleExpanded} className="btn btn-link">expand</button></div>);

		if(this.state.expanded){
			expandIcon = (<ChevronDown/>);
			panelBody = (
				<div className="table-responsive">
					<table className="table table-striped">
						<colgroup>
							<col style={{width:"5%"}}/>
							<col style={{width:"65%"}}/>
							<col style={{width:"5%"}}/>
							<col style={{width:"10%"}}/>
							<col style={{width:"5%"}}/>
							<col style={{width:"10%"}}/>
						</colgroup>
						<thead>
							<tr>
								<th>#</th>
								<th>Question</th>
								<th>Comment Required</th>
								<th>Question Type</th>
								<th>Max. Marks</th>
								<th>
									<Link to={`/audit_cycle/${this.props.auditCycleId}/questionnaire/section/${this.props.section.id}/question/add`} className="btn btn-default">
										<Plus/>
									</Link>
								</th>
							</tr>
						</thead>
						<tbody>
							{questionRows}
						</tbody>
					</table>
				</div>
			);
		}
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<span className="pull-right">
						{ this.props.section.minimum_attachment_count > 0 ? <span><b>{this.props.section.minimum_attachment_count}</b> attachments,</span> : null }
						<b>{this.props.section.questions.length}</b> questions,
						<b>{this.props.section.max_marks}</b> marks
						&nbsp;
						<Link to={`/audit_cycle/${this.props.auditCycleId}/questionnaire/section/${this.props.section.id}/proof_tag`} className="btn btn-default">
							Proof Tag
						</Link>
						&nbsp;
						<Link to={`/audit_cycle/${this.props.auditCycleId}/questionnaire/section/${this.props.section.id}/edit`} className="btn btn-default">
							<Pencil/>
						</Link>
						<button type="button" onClick={this.props.onDelete ? () => this.props.onDelete(this.props.section): ()=>{}} className="btn btn-default" title="Delete Section"><Cross/></button>
					</span>
					<h4 className="panel-title">
						<a onClick={this.toggleExpanded} style={pointerStyle} className="btn btn-sm btn-default">
							{expandIcon}
						</a>
							&nbsp;
						{this.props.section.sequence} - <b>{this.props.section.name}</b>
					</h4>
				</div>
				<CSSTransitionGroup
					transitionName="fade"
					transitionEnterTimeout={500}
					transitionLeaveTimeout={300}>
					{panelBody}
				</CSSTransitionGroup>
			</div>
		);
	}
}
