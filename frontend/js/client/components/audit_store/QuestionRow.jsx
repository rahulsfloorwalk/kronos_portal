import React from "react";
import PropTypes from "prop-types";

import ImpactFactorTags from "../../../components/ImpactFactorTags.jsx";

export default class QuestionRow extends React.Component{
	static propTypes = {
		answer: PropTypes.shape({
			id: PropTypes.number.isRequired,
			not_applicable: PropTypes.bool.isRequired,
			answer_text: PropTypes.string,
			marks_obtained: PropTypes.number,
			answer_comment: PropTypes.string,
		}),
		q: PropTypes.shape({
			id: PropTypes.number.isRequired,
			question_txt: PropTypes.string,
			max_marks: PropTypes.number,
			sequence: PropTypes.number,
			question_type: PropTypes.string,
			question_data: PropTypes.object,
		}),
		showMarks: PropTypes.bool,
	};

	render(){
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
				if(this.props.q.question_type === "MULTISELECT"){
					if (answerText === ""){
						answerText = "No Option Selected";
					}
					else{
						answerText = (this.props.answer.answer_text).replaceAll(";", ", ");
					}
				}
				if( this.props.showMarks){
					answerMarks = this.props.answer.marks_obtained;
				}
			}
		}
		return (
			<tr>
				<td>{this.props.q.sequence}</td>
				<td>
					<div className="pull-right">
						<ImpactFactorTags impactFactors={this.props.q.question_data && this.props.q.question_data.impact_factors}/>
					</div>
					{this.props.q.question_txt}
				</td>
				<td>
					{answerText}
					{ (this.props.q.question_type === "MUTEX" || this.props.q.question_type === "MULTISELECT") && this.props.answer && this.props.answer.answer_comment
						? " (" + this.props.answer.answer_comment + ")"
						: null
					}
				</td>
				<td>{answerMarks}</td>
				<td>{maxMarks}</td>
				<td>
				</td>
			</tr>
		);
	}
}

