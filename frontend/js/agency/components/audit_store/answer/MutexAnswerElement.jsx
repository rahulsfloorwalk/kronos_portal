import React from "react";
import PropTypes from "prop-types";

import AnswerComment from "./AnswerComment.jsx";

export default class MutexAnswerElement extends React.Component {
	static propTypes = {
		auditStoreId: PropTypes.number.isRequired,
		questionId: PropTypes.number.isRequired,

		editable: PropTypes.bool.isRequired,

		answerText: PropTypes.string.isRequired,
		onChange: PropTypes.func.isRequired,

		onFocus: PropTypes.func.isRequired,
		onBlur: PropTypes.func.isRequired,

		options: PropTypes.arrayOf(PropTypes.shape({
			sequence: PropTypes.number.isRequired,
			value: PropTypes.string.isRequired,
		})).isRequired,
	};
	render(){
		if(this.props.editable){
			return <div className="row">
				<div className="col-xs-5">
					<select className="form-control"
						name="answerText"
						onChange={this.props.onChange}
						onFocus={this.props.onFocus}
						onBlur={this.props.onBlur}
						value={this.props.answerText}>
						<option value="">select answer</option>
						{this.props.options.map(o => <option key={o.sequence} value={o.value}>{o.value}</option>)}
					</select>
				</div>
				<div className="col-xs-7">
					<AnswerComment
						auditStoreId={this.props.auditStoreId}
						questionId={this.props.questionId}
					/>
				</div>
			</div>;
		}
		else {
			return (<p>
				{this.props.answerText}
				<AnswerComment
					auditStoreId={this.props.auditStoreId}
					questionId={this.props.questionId}
				/>
			</p>);
		}
	}
}
