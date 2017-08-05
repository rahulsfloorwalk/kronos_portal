import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Jumbotron from '../Jumbotron.jsx';
import Panel from '../Panel.jsx';
import { Plus, Cross, Pencil, Check } from '../Icons.jsx';

import { affectInputEventToComponent } from '../../react_utils.js'

import { submitAnswer } from '../../auditor/actions/answer.js';

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
		if(this.props.answer.answer_text === this.state.answer_text){
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
		let goodClass = "";
		let noAnswerText = "-";
		let answer;

		if(this.state.answer_text){
			answer = this.state.answer_text;
			goodClass = "success";
		} else {
			answer = (<span className="text-muted">{noAnswerText}</span>);
		}


		let answerElement = (<p>{answer}</p>);

		if(this.props.auditStore && this.props.auditStore.status === 'ASSIGNED'){
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
		}


		if(this.state.saving){
			var savingMessage = (<span className="text-warning">&nbsp;&nbsp;&nbsp;saving...</span>);
			goodClass = "";
		}

		if(this.state.focused){
			goodClass = "";
		}

		return (
			<tr className={goodClass}>
				<td>
					<div className="row">
					<div className="col-xs-1 text-right">
					{this.props.q.sequence}
					</div>
					<div className="col-xs-11 col-md-5">
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
