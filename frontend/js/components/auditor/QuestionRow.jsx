import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Jumbotron from '../Jumbotron.jsx';
import Panel from '../Panel.jsx';
import { Plus, Cross, Pencil } from '../Icons.jsx';

import { affectInputEventToComponent } from '../../react_utils.js'

import { submitAnswer } from '../../auditor/actions/answer.js';

var QuestionRow = React.createClass({
	getInitialState: function(){
		return {
			editing: false,
			answer_text: "",
		};
	},
	startEdit: function(e){
		e.preventDefault();
		if(this.props.auditStore && this.props.auditStore.status === 'ASSIGNED' && !this.state.editing){
			this.setState({
				editing: true
			});
		}
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
	componentDidUpdate: function(prevProps,prevState){
		if(this.answerInput && prevState.editing === false){
			this.answerInput.focus();
			let l = this.answerInput.value.length;
			this.answerInput.setSelectionRange(l,l);
		}
	},
	submitAnswer: function(e){
		e.preventDefault();
		this.setState({
			editing: false,
			saving: true,
		});
		var payload = {
			question: this.props.q.id,
			answer_text: this.state.answer_text,
			audit_store: this.props.auditStoreId,
		};
		console.log("this.props",this.props);
		console.log("payload",payload);
		this.props.dispatch(submitAnswer(payload)).then(() => this.setState({saving: false}));
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	render: function(){
		let pointerStyle = {cursor: 'pointer'};
		if(this.props.auditStore && this.props.auditStore.status === 'ASSIGNED'){
			var defaultAnswer = "click to enter answer";
		}
		let answer = this.state.answer_text || (<span className="text-muted">{defaultAnswer}</span>);
		if(this.state.editing){
			var answerElement = (
					<form className="input-group" onSubmit={this.submitAnswer}>
						<input
							className="form-control"
							name="answer_text"
							value={this.state.answer_text}
							onBlur={this.submitAnswer}
							onChange={this.inputChanged}
							ref={(input) => this.answerInput = input}
						/>
						<span className="input-group-btn">
							<button className="btn btn-primary">Save</button>
						</span>
					</form>
			);
		} else {
			var answerElement = (<p style={pointerStyle} onClick={this.startEdit}>{answer}</p>);
		}

		if(this.state.saving){
			var savingMessage = (<span className="text-warning">&nbsp;&nbsp;&nbsp;saving...</span>);
		}

		return (
			<tr>
				<td>{this.props.q.sequence}</td>
				<td>
					<p onClick={this.startEdit} style={pointerStyle}><b>{this.props.q.question_txt}</b>{savingMessage}</p>
					{answerElement}
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
