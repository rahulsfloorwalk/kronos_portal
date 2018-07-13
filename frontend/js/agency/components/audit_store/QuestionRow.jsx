import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { } from "react-router";

import { } from "../../../components/Icons.jsx";

import { } from "../../actions/answer.js";
import AnswerElement from "./AnswerElement.jsx";

import { questionPropType } from "../../prop_types.js";

class __QuestionRow extends React.Component{
	static propTypes = {
		auditStoreId: PropTypes.number.isRequired,
		question: questionPropType.isRequired,

		showErrors: PropTypes.bool,

		answer: PropTypes.object,
		auditStore: PropTypes.object,
	};

	state = {
		touched: false,
		focused: false,
	};

	onFocus = () => {
		this.setState({
			focused: true,
		});
	};

	onBlur = () => {
		this.setState({
			touched: true,
			focused: false,
		});
	};

	render(){
		if(this.state.saving){
			var savingMessage = (<span className="text-warning">&nbsp;&nbsp;&nbsp;saving...</span>);
		}

		const goodClass = this.props.answer && this.props.answer.answer_text ? "success" : "";
		const badClass = this.props.showErrors && !this.state.answer_text ? "danger" : "";
		return (
			<tr className={goodClass || badClass}>
				<td>
					<div className="row">
						<div className="col-xs-1 text-right">
							{this.props.question.sequence}
						</div>
						<div className="col-xs-10 col-md-5">
							<p><b>{this.props.question.question_txt}</b>{savingMessage}</p>
						</div>
						<div className="col-xs-offset-1 col-xs-11 col-md-offset-0 col-sm-11 col-md-6">
							<AnswerElement
								onFocus={this.onFocus}
								onBlur={this.onBlur}
								question={this.props.question}
								auditStoreId={this.props.auditStore.id}
							/>
						</div>
					</div>
				</td>
			</tr>
		);
	}
}

const findAnswer = (store, auditStoreId, questionId) => {
	return store.answers.find((a) => a.audit_store_id === auditStoreId && a.question_id === questionId);
};

const findAuditStore = (store, auditStoreId) => {
	return store.auditStores.find((as) => as.id === auditStoreId);
};

const mapStoreToProps = (store, ownProps) => {
	return {
		answer: findAnswer(store, ownProps.auditStoreId, ownProps.question.id),
		auditStore : findAuditStore(store, ownProps.auditStoreId),
	};
};

const QuestionRow = connect(mapStoreToProps)(__QuestionRow);

QuestionRow.propTypes = {
	auditStoreId: PropTypes.number.isRequired,
	question: questionPropType.isRequired,
};

export default QuestionRow;
