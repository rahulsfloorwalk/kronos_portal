import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { Cross, Pencil } from "../../../components/Icons.jsx";

import { getQuestionType,getQuestionVisibility } from "../../../utils.js";
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
		var styles = {
			col1: { width: "2.5%" },
			col2: { width: "55%" },
			col3: { width: "20%" },
			col4: { width: "5%" },
			col5: { width: "2.5%" },
			col6: { width: "2.5%" },
			col7: { width: "2.5%" },
			col8: { width: "2.5%" },
			col9: { width: "7.5%" },
		};
		return (
			<tr>
				<td style={styles.col1}>{this.props.q.sequence}</td>
				<td style={styles.col2}>
					<div className="pull-right">
						<ImpactFactorTags impactFactors={this.props.q.question_data && this.props.q.question_data.impact_factors}/>
					</div>
					<MarkdownViewer markdown={this.props.q.question_txt || ""}/>
					<span className="text-muted">{
						this.props.q.question_type === "MUTEX" || this.props.q.question_type === "MULTISELECT"
							? this.props.q.question_data.options.map(o => o.value).join(" / ")
							: null
					}</span>
				</td>
				<td style={styles.col3}>{this.props.q.question_note ? this.props.q.question_note : "---"}</td>
				<td style={styles.col4}>{this.props.q.visibility ? getQuestionVisibility(this.props.q.visibility) : "---"}</td>
				<td style={styles.col5}>{this.props.q.is_required ? "Yes" : "No"}</td>
				<td style={styles.col6}>{this.props.q.optional_comment_required ? "Yes" : "No"}</td>
				<td style={styles.col7}>{getQuestionType(this.props.q.question_type)}</td>
				<td style={styles.col8}>{this.props.q.max_marks}</td>
				<td style={styles.col9}>
					<Link to={`/audit_cycle/${this.props.auditCycleId}/questionnaire/section/${this.props.q.section}/question/${this.props.q.id}/edit`} className="btn btn-default"><Pencil/></Link>
					<button type="button" onClick={this.props.onDelete ? () => this.props.onDelete(this.props.q): ()=>{}} className="btn btn-default" title="Delete Question"><Cross/></button>
				</td>
			</tr>
		);
	}
	//<Link to={`/audit_cycle/${this.props.auditCycleId}/questionnaire/section/${this.props.q.section}/question/${this.props.q.id}/delete`} className="btn btn-default"><Cross/></Link>
}
