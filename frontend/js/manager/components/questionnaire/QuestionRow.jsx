import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { Cross, Pencil } from "../../../components/Icons.jsx";

import { getQuestionType } from "../../../utils.js";
import { questionPropType } from "./prop_types";

import ImpactFactorTags from "../../../components/ImpactFactorTags.jsx";
import MarkdownViewer from "../../../../js/components/MarkdownViewer.jsx";

export default class QuestionRow extends React.Component {
	static propTypes = {
		q: questionPropType,
		auditCycleId: PropTypes.string,
		onDelete: PropTypes.func,
	};
	render() {
		return (
			<tr>
				<td>{this.props.q.sequence}</td>
				<td>
					<div className="pull-right">
						<ImpactFactorTags impactFactors={this.props.q.question_data && this.props.q.question_data.impact_factors}/>
					</div>
					<MarkdownViewer markdown={this.props.q.question_txt || ""}/>
					<span className="text-muted">{
						this.props.q.question_type === "MUTEX" || this.props.q.question_type === "MULTISELECT"
							? this.props.q.question_data.options && this.props.q.question_data.options.map(o => o.value).join(" / ")
							: null
					}</span>
				</td>
				<td>{this.props.q.optional_comment_required ? "Yes" : "No"}</td>
				<td>{getQuestionType(this.props.q.question_type)}</td>
				<td>{this.props.q.max_marks}</td>
				<td>
					<Link to={`/audit_cycle/${this.props.auditCycleId}/questionnaire/section/${this.props.q.section}/question/${this.props.q.id}/edit`} className="btn btn-default"><Pencil/></Link>
					<button type="button" onClick={this.props.onDelete ? () => this.props.onDelete(this.props.q): ()=>{}} className="btn btn-default" title="Delete Question"><Cross/></button>
				</td>
			</tr>
		);
	}
	//<Link to={`/audit_cycle/${this.props.auditCycleId}/questionnaire/section/${this.props.q.section}/question/${this.props.q.id}/delete`} className="btn btn-default"><Cross/></Link>
}
