import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { } from "react-router";

import { } from "../../../../components/Icons.jsx";

import { setAnswerText } from "../../../actions/answer.js";
import { findAnswer } from "../../../reducers/answer.js";
import { findAuditStore } from "../../../reducers/audit_store.js";

import { questionPropType } from "../../../prop_types.js";

import PlainAnswerElement from "./PlainAnswerElement.jsx";
import MutexAnswerElement from "./MutexAnswerElement.jsx";
import MultiSelectAnswerElement from "./MultiSelectAnswerElement.jsx";

export class __AnswerElement extends React.Component{
	static propTypes = {
		question: questionPropType.isRequired,
		auditStoreId: PropTypes.number.isRequired,

		answer: PropTypes.object,
		answerText: PropTypes.string.isRequired,
		setAnswerText: PropTypes.func.isRequired,

		onFocus: PropTypes.func.isRequired,
		onBlur: PropTypes.func.isRequired,

		editable: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		answerText: "",
	};

	state = {
		answerText: "",
	};

	componentDidMount(){
		this.setState({
			answerText: this.props.answerText,
		});
	}

	componentWillReceiveProps(nextProps){
		this.setState({
			answerText: nextProps.answerText,
		});
	}

	onFocus = () => {
		this.props.onFocus();
	};

	answerChanged = (e) => {
		this.setState({
			answerText: e.target.value,
		});
	};

	onBlur = () => {
		if( this.props.answerText !== this.state.answerText){
			this.props.setAnswerText(this.state.answerText, true);
		}
		this.props.onBlur();
	};

	submitMultiSelectAnswer = (e) => {
		this.props.setAnswerText(e.target.value, e.target.checked);
	};

	render(){
		if(this.props.question.question_type === "PLAIN"){
			return <PlainAnswerElement
				editable={this.props.editable}
				answerText={this.state.answerText}

				onChange={this.answerChanged}

				onFocus={this.onFocus}
				onBlur={this.onBlur}
			/>;
		} else if(this.props.question.question_type === "MUTEX") {
			return <MutexAnswerElement
				editable={this.props.editable}
				answerText={this.state.answerText}

				onChange={this.answerChanged}

				onFocus={this.onFocus}
				onBlur={this.onBlur}

				questionId={this.props.question.id}
				auditStoreId={this.props.auditStoreId}

				options={this.props.question.question_data.options}
			/>;
		} else if(this.props.question.question_type === "MULTISELECT") {
			return <MultiSelectAnswerElement
				editable={this.props.editable}
				answerText={this.state.answerText}
				answer={this.props.answer}

				questionId={this.props.question.id}
				auditStoreId={this.props.auditStoreId}

				onClick={this.submitMultiSelectAnswer}

				options={this.props.question.question_data.options}
			/>;
		}
	}
}

const mapStoreToProps = (store, ownProps) => {
	const auditStore = findAuditStore(store, ownProps.auditStoreId);
	const answer = findAnswer(store, ownProps.auditStoreId, ownProps.question.id);
	return {
		answer: answer,
		answerText: answer && answer.answer_text,
		editable: auditStore && auditStore.is_editable_by_agency,
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		setAnswerText: (answerText, status) => {
			dispatch(setAnswerText(ownProps.auditStoreId, ownProps.question.id, answerText, status));
		},
	};
};

const AnswerElement = connect(mapStoreToProps, mapDispatchToProps)(__AnswerElement);

AnswerElement.propTypes = {
	auditStoreId: PropTypes.number.isRequired,
	question: questionPropType.isRequired,

	onFocus: PropTypes.func.isRequired,
};



export default AnswerElement;
