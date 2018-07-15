import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { } from "react-router";

import { } from "../../../components/Icons.jsx";

import { setAnswerText } from "../../actions/answer.js";

import { questionPropType } from "../../prop_types.js";

import AnswerComment from "./AnswerComment.jsx";

class __PlainAnswerElement extends React.Component {
	static propTypes = {
		editable: PropTypes.bool.isRequired,

		answerText: PropTypes.string.isRequired,
		onChange: PropTypes.func.isRequired,

		onFocus: PropTypes.func.isRequired,
		onBlur: PropTypes.func.isRequired,
	};

	submitAnswer = (e) => {
		e.preventDefault();
		this.props.onBlur();
	};

	render(){
		if(this.props.editable){
			return <form className="" onSubmit={this.submitAnswer}>
				<input
					className="form-control"
					placeholder="type your answer here"
					name="answerText"
					value={this.props.answerText}
					onFocus={this.props.onFocus}
					onBlur={this.props.onBlur}
					onChange={this.props.onChange}
					ref={(input) => this.answerInput = input}
				/>
			</form>;
		} else {
			return <p>{this.props.answerText}</p>;
		}
	}
}

class __MutexAnswerElement extends React.Component {
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

class __AnswerElement extends React.Component{
	static propTypes = {
		question: questionPropType.isRequired,
		auditStore: PropTypes.object,

		answerText: PropTypes.string.isRequired,
		setAnswerText: PropTypes.func.isRequired,

		onFocus: PropTypes.func.isRequired,
		onBlur: PropTypes.func.isRequired,

		showErrors: PropTypes.bool.isRequired,
		editable: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		answerText: "",
		showErrors: false,
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
			this.props.setAnswerText(this.state.answerText);
		}
		this.props.onBlur();
	};

	render(){
		if(this.props.question.question_type === "PLAIN"){
			return <__PlainAnswerElement
				editable={this.props.editable}
				answerText={this.state.answerText}

				onChange={this.answerChanged}

				onFocus={this.onFocus}
				onBlur={this.onBlur}
			/>;
		} else if(this.props.question.question_type === "MUTEX") {
			return <__MutexAnswerElement
				editable={this.props.editable}
				answerText={this.state.answerText}

				onChange={this.answerChanged}

				onFocus={this.onFocus}
				onBlur={this.onBlur}

				questionId={this.props.question.id}
				auditStoreId={this.props.auditStore.id}

				options={this.props.question.question_data.options}
			/>;
		}
	}
}

const findAnswer = (store, auditStoreId, questionId) => {
	return store.answers.find((a) => a.audit_store_id === auditStoreId && a.question_id === questionId);
};

const findAuditStore = (store, auditStoreId) => {
	return store.auditStores.find((as) => as.id === auditStoreId);
};

const mapStoreToProps = (store, ownProps) => {
	const auditStore = findAuditStore(store, ownProps.auditStoreId);
	const answer = findAnswer(store, ownProps.auditStoreId, ownProps.question.id);
	return {
		answer: answer,
		answerText: answer && answer.answer_text,
		auditStore: auditStore,
		editable: auditStore && auditStore.is_editable_by_auditor,
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		setAnswerText: (answerText) => {
			dispatch(setAnswerText(ownProps.auditStoreId, ownProps.question.id, answerText));
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
