import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { } from "react-router";

import { } from "../../Icons.jsx";

import { affectInputEventToComponent } from "../../../react_utils.js";

import { submitAnswer } from "../../../auditor/actions/answer.js";

import AnswerComment from "./AnswerComment.jsx";

class QuestionRow extends React.Component{
	static propTypes = {
		auditStoreId: PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.string,
		]).isRequired,
		q: PropTypes.object.isRequired,
		dispatch: PropTypes.func.isRequired,
		showErrors: PropTypes.bool.isRequired,

		answer: PropTypes.object,
		auditStore: PropTypes.object,
	};

	constructor(props){
		super(props);
		this.state = {
			answer_text: "",
			touched: false,
			focused: false,
		};
	}

	componentDidMount(){
		if(this.props.answer){
			this.setState({
				answer_text: this.props.answer.answer_text
			});
		}
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.answer){
			this.setState({
				answer_text: nextProps.answer.answer_text
			});
		}
	}

	onFocus = () => {
		this.setState({
			touched: true,
			focused: true,
		});
	};

	submitAnswer = (e) => {
		e.preventDefault();
		if( this.props.answer && this.props.answer.answer_text === this.state.answer_text){
			this.setState({
				focused: false,
			});
			return;
		}
		this.setState({
			saving: true,
			focused: false,
		});
		let payload = {
			question: this.props.q.id,
			answer_text: this.state.answer_text,
			audit_store: this.props.auditStoreId,
		};
		this.props.dispatch(submitAnswer(payload)).then(() => this.setState({saving: false}));
	};

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	render(){
		let noAnswerText = "-";
		let answer;

		if(this.state.answer_text){
			answer = this.state.answer_text;
		} else {
			answer = (<span className="text-muted">{noAnswerText}</span>);
		}

		let answerElement = (<p>
			{answer} 
			{ this.props.q.question_type === "MUTEX" 
				? <AnswerComment editable={false}
					audit_store_id={this.props.auditStoreId} question_id={this.props.q.id} 
					answer_comment={this.props.answer && this.props.answer.answer_comment }
				/>
				: ""
			}
		</p>);

		if(this.props.auditStore && this.props.auditStore.status === "ACKNOWLEDGED"){
			if(this.props.q.question_type === "PLAIN"){
				answerElement = (
					<form className="" onSubmit={this.submitAnswer}>
						<input
							className="form-control"
							placeholder="type your answer here"
							name="answer_text"
							value={this.state.answer_text}
							onFocus={this.onFocus}
							onBlur={this.submitAnswer}
							onChange={this.inputChanged}
							ref={(input) => this.answerInput = input}
						/>
					</form>
				);
			} else if(this.props.q.question_type === "MUTEX") {
				answerElement = (
					<div className="row">
						<div className="col-xs-5">
						<select className="form-control"
							name="answer_text"
							onChange={this.inputChanged}
							onFocus={this.onFocus}
							onBlur={this.submitAnswer}
							value={this.state.answer_text}>
							<option value="">select answer</option>
							{this.props.q.question_data.options.map(o => <option key={o.sequence} value={o.value}>{o.value}</option>)}
						</select>
						</div>
						<div className="col-xs-7">
							<AnswerComment audit_store_id={this.props.auditStoreId} question_id={this.props.q.id} answer_comment={this.props.answer ? this.props.answer.answer_comment : ""} editable={true}/>
						</div>
					</div>
				);
			}
		}


		if(this.state.saving){
			var savingMessage = (<span className="text-warning">&nbsp;&nbsp;&nbsp;saving...</span>);
		}

		let goodClass = this.state.focused || this.state.saving || !this.state.answer_text ? "" : "success";
		let badClass = this.props.showErrors && !this.state.answer_text ? "danger" : "";
		return (
			<tr className={goodClass || badClass}>
				<td>
					<div className="row">
					<div className="col-xs-1 text-right">
					{this.props.q.sequence}
					</div>
					<div className="col-xs-10 col-md-5">
					<p><b>{this.props.q.question_txt}</b>{savingMessage}</p>
					</div>
					<div className="col-xs-offset-1 col-xs-11 col-md-offset-0 col-sm-11 col-md-6">
					{answerElement}
					</div>
					</div>
				</td>
			</tr>
		);
	}
}

var mapStoreToProps = function(store, ownProps){
	return {
		answer: (function(answers){
			for(let id in answers){
				if(answers[id].question_id === ownProps.q.id){
					return answers[id];
				}
			}
		})(store.answers),
		auditStore : store.auditStores[ownProps.auditStoreId]
	};
};

export default connect(mapStoreToProps)(QuestionRow);
