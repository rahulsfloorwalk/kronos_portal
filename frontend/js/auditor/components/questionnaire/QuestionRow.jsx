import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { } from "react-router";

import Alert from "react-s-alert";

import { Cross } from "../../../components/Icons.jsx";
import MarkdownViewer from "../../../../js/components/MarkdownViewer.jsx";

import { affectInputEventToComponent } from "../../../react_utils.js";
// import { GrammarlyEditorPlugin} from "@grammarly/editor-sdk-react";

// import { ClientID } from "../../../constants.js";

import { submitAnswer } from "../../actions/answer.js";

import AnswerComment from "./AnswerComment.jsx";

class QuestionRow extends React.Component {
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

	constructor(props) {
		super(props);
		this.state = {
			revert_message: "",
			answer_text: "",
			touched: false,
			focused: false,
		};

	}

	componentDidMount() {
		if (this.props.answer) {
			this.setState({
				answer_text: this.props.answer.answer_text,
				revert_message: this.props.answer.revert_message,
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.answer) {
			this.setState({
				answer_text: nextProps.answer.answer_text,
				revert_message: nextProps.answer.revert_message,
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
		if (this.props.answer && this.props.answer.answer_text === this.state.answer_text) {
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
			status: true
		};
		this.props.dispatch(submitAnswer(payload)).then(() => this.setState({ saving: false }));
		Alert.success("Data Saved");
	};

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	submitMultiSelectAnswer = (e) => {
		let payload = {
			question: this.props.q.id,
			answer_text: e.target.value,
			audit_store: this.props.auditStoreId,
			status: e.target.checked
		};
		this.props.dispatch(submitAnswer(payload)).then(() => this.setState({ saving: false }));
	};

	render() {

		if (this.props.q.hide_question && (this.state.answer_text === "" || this.state.answer_text === undefined)) {
			return null;
		}
		let noAnswerText = "-";
		let answer;

		if (this.state.answer_text) {
			answer = this.state.answer_text;
		} else {
			answer = (<span className="text-muted">{noAnswerText}</span>);
		}
		if(this.state.saving){
			var savingMessage = (<span className="text-warning">&nbsp;&nbsp;&nbsp;saving...</span>);
		}

		// if(this.props.q.question_type === "MULTISELECT"){
		// 	answer = (this.state.answer_text).replaceAll(";", ", ");
		// }
		if (answer === "") {
			answer = "No answer selected";
		}
		let answerElement = (<p>
			{answer}
			{this.props.q.question_type === "MUTEX" || this.props.q.question_type === "MULTISELECT"
				? <AnswerComment editable={false}
					audit_store_id={this.props.auditStoreId} question_id={this.props.q.id}
					answer_comment={this.props.answer && this.props.answer.answer_comment}
					required={this.props.q.optional_comment_required}
					showErrors={this.props.showErrors}
				/>
				: ""
			}
		</p>);

		if (this.props.auditStore && this.props.auditStore.status === "ACKNOWLEDGED") {
			if (this.props.q.question_type === "PLAIN") {
				answerElement = (
					<form className="" onSubmit={this.submitAnswer}>
						{/* <GrammarlyEditorPlugin clientId={ClientID}> */}
						<textarea
							className="form-control"
							placeholder="type your answer here"
							name="answer_text"
							value={this.state.answer_text}
							onFocus={this.onFocus}
							onBlur={this.submitAnswer}
							onChange={this.inputChanged}
							ref={(input) => this.answerInput = input}
						></textarea>
						{/* </GrammarlyEditorPlugin> */}
					</form>
				);
			} else if (this.props.q.question_type === "MUTEX") {
				answerElement = (
					<div className="row">
						<div className="col-xs-5">
							<select className="form-control"
								name="answer_text"
								style={
									this.props.q.question_data.options.some((o) => o.value === this.state.answer_text && o.marks === 0)
										? { border: "solid 1px #a94442" }
										: {}
								}
								onChange={this.inputChanged}
								onFocus={this.onFocus}
								onBlur={this.submitAnswer}
								value={this.state.answer_text}>
								<option value="">select answer</option>
								{this.props.q.question_data.options.map(o => <option key={o.sequence} value={o.value}>{o.value}</option>)}
							</select>
						</div>
						<div className="col-xs-7">
							<AnswerComment
								audit_store_id={this.props.auditStoreId}
								question_id={this.props.q.id}
								answer_comment={this.props.answer ? this.props.answer.answer_comment : ""}
								editable={true}
								required={this.props.q.optional_comment_required}
								ans={this.props.q.question_data.options.some((o) => o.value === this.state.answer_text && o.marks === 0)}
								// required={this.props.q.optional_comment_required? this.props.q.optional_comment_required : true}
								showErrors={this.props.showErrors} />
						</div>
					</div>
				);
			} else if (this.props.q.question_type === "MULTISELECT") {
				let checkbox_list = [];
				let multiselect_answer_list = [];
				if (this.props.answer) {
					multiselect_answer_list = this.props.answer.get_answer_text_list;
				}
				for (let o of this.props.q.question_data.options) {
					if (multiselect_answer_list.includes(o.value)) {
						checkbox_list.push(<label style={{ fontSize: "14px", marginBottom: "10px" }} key={o.sequence}><input type="checkbox" value={o.value} name="answer_text" onClick={this.submitMultiSelectAnswer} defaultChecked style={{ verticalAlign: "bottom", width: "20px", height: "20px" }} /><span> {o.value}</span>&nbsp;</label>);
					}
					else {
						checkbox_list.push(<label style={{ fontSize: "14px", marginBottom: "10px" }} key={o.sequence}><input type="checkbox" value={o.value} name="answer_text" onClick={this.submitMultiSelectAnswer} style={{ verticalAlign: "bottom", width: "20px", height: "20px" }} /><span> {o.value}</span>&nbsp;</label>);
					}
				}

				answerElement = (
					<div className="row">
						<div className="col-xs-5">
							{checkbox_list}
						</div>
						{this.props.q.optional_comment_required &&
						<div className="col-xs-7">
							<AnswerComment audit_store_id={this.props.auditStoreId} question_id={this.props.q.id} answer_comment={this.props.answer ? this.props.answer.answer_comment : ""} editable={true} required={this.props.q.optional_comment_required} showErrors={this.props.showErrors} />
						</div>
						}
					</div>
				);
			}
		}
		let goodClass = this.state.focused || this.state.saving || !this.state.answer_text ? "" : "success";
		let badClass = this.props.showErrors && !this.state.answer_text ? "danger" : "";
		return (
			<tr className={goodClass || badClass}>
				<td>
					<div className="row">
						<div className="col-xs-1" style={{ display: "flex", justifyContent: "space-between" }}>
							{this.props.auditStore && this.props.auditStore.status === "ACKNOWLEDGED" && this.state.revert_message ? <div className="text-danger" ><Cross /></div> : <div />}
							{this.props.q.sequence}
						</div>
						<div className="col-xs-10 col-md-5">
							<b><MarkdownViewer markdown={this.props.q.question_txt || ""} />{savingMessage}</b>
						</div>
						<div className="col-xs-offset-1 col-xs-11 col-md-offset-0 col-sm-11 col-md-6">
							{answerElement}
						</div>
						{this.props.auditStore && this.props.auditStore.status === "ACKNOWLEDGED" && this.state.revert_message ? <div className="col-xs-12 col-xs-offset-1 col-md-12 col-md-offset-1" style={{ marginTop: "9px" }}>
							<p className="text-danger"><b>Revert message: </b>{this.state.revert_message}</p>
						</div> : null}
					</div>
				</td>
			</tr>
		);
	}
}

var mapStoreToProps = function (store, ownProps) {
	return {
		answer: (function (answers) {
			for (let id in answers) {
				if (answers[id].question_id === ownProps.q.id) {
					return answers[id];
				}
			}
		})(store.answers),
		auditStore: store.auditStores[ownProps.auditStoreId]
	};
};

export default connect(mapStoreToProps)(QuestionRow);
