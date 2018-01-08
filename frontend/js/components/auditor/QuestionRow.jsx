import React, { Component } from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Jumbotron from '../Jumbotron.jsx';
import Panel from '../Panel.jsx';
import { Plus, Cross, Pencil, Check } from '../Icons.jsx';

import { affectInputEventToComponent } from '../../react_utils.js'

import { submitAnswer, submitAnswerComment } from '../../auditor/actions/answer.js';

class __AnswerComment extends Component {
	constructor(props){
		super(props);
		this.state = {
			answer_comment: this.props.answer_comment || "",
		};
	}

	commentChanged = (e) => {
		this.setState({
			answer_comment: e.target.value,
		});
	}

	onBlur = (e) => {
		this.commentChanged(e);
		this.props.dispatch(submitAnswerComment(this.props.audit_store_id, this.props.question_id, e.target.value));
	}

	render(){
		if(this.props.editable){
			return (
				<input className="form-control" value={this.state.answer_comment} onChange={this.commentChanged} onBlur={this.onBlur} placeholder="optional comment"/>
			);
		} else {
			return this.props.answer_comment ? <span> ( {this.props.answer_comment})</span> : null;
		}
	}
}

let AnswerComment = ReactRedux.connect()(__AnswerComment);

var QuestionRow = React.createClass({
	getInitialState: function(){
		return {
			answer_text: "",
			touched: false,
			focused: false,
		};
	},
	componentDidMount: function(){
		if(this.props.answer){
			this.setState({
				answer_text: this.props.answer.answer_text
			});
		}
	},
	componentWillReceiveProps: function(nextProps){
		if(nextProps.answer){
			this.setState({
				answer_text: nextProps.answer.answer_text
			});
		}
	},
	onFocus: function(){
		this.setState({
			touched: true,
			focused: true,
		});
	},
	submitAnswer: function(e){
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
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	render: function(){
		let noAnswerText = "-";
		let answer;

		if(this.state.answer_text){
			answer = this.state.answer_text;
		} else {
			answer = (<span className="text-muted">{noAnswerText}</span>);
		}


		let answerComment;
		let answerElement = (<p>
			{answer} 
			{ this.props.q.question_type === "MUTEX" 
				? <AnswerComment editable={false}
					audit_store_id={this.props.auditStoreId} question_id={this.props.q.id} 
					answer_comment={this.props.answer && this.props.answer.answer_comment ? this.props.answer.answer_comment : ""}
				/>
				: ""
			}
		</p>);

		if(this.props.auditStore && this.props.auditStore.status === 'ACKNOWLEDGED'){
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
	},
});

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

export default ReactRedux.connect(mapStoreToProps)(QuestionRow);
