import React, { Component } from "react";
import PropTypes from "prop-types";

import Alert from "react-s-alert";

import { connect } from "react-redux";

import { submitAnswerComment } from "../../actions/answer.js";
import { GrammarlyEditorPlugin} from "@grammarly/editor-sdk-react";
import { ClientID } from "../../../constants.js";
class __AnswerComment extends Component {

	static propTypes = {
		answer_comment: PropTypes.string.isRequired,
		audit_store_id: PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.string,
		]).isRequired,
		question_id: PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.string,
		]).isRequired,
		dispatch: PropTypes.func.isRequired,
		editable: PropTypes.bool.isRequired,
		required: PropTypes.bool.isRequired,
		ans: PropTypes.bool.isRequired,
		showErrors: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		editable: false,
	};

	constructor(props){
		super(props);
		this.state = {
			answer_comment: this.props.answer_comment || "",
			error: false,
			comment_error:""
		};
	}

	componentDidMount(){
		this.setState({ answer_comment: this.props.answer_comment,comment_error:"" });
	}

	componentWillReceiveProps(nextProps){
		this.setState({ answer_comment: nextProps.answer_comment });
	}

	commentChanged = (e) => {
		this.setState({
			answer_comment: e.target.value,
			comment_error:""
		});
	};

	onBlur = (e) => {
		if(this.props.required && e.target.value.trim() === ""){
			this.setState({
				error: true,
				comment_error:""
			});
		}
		else{
			this.commentChanged(e);
			this.props.dispatch(submitAnswerComment(this.props.audit_store_id, this.props.question_id, e.target.value)).fail((err)=>{
				let error=err.responseJSON.non_field_errors;
				this.setState({comment_error : error ? error :""});
			});
			Alert.success("Data Saved");
			this.setState({
				error: false,
			});
		}
	};

	render(){
		if(this.props.editable && this.props.required || this.props.ans){
			return (
				<div>
					<GrammarlyEditorPlugin clientId={ClientID}>
						<input
							className="form-control"
							style={
								(this.props.showErrors && this.props.required && !this.state.answer_comment) || this.state.comment_error || this.state.error
									?
									{border: "solid 1px #a94442"}
									: null
							}
							value={this.state.answer_comment}
							onChange={this.commentChanged}
							onBlur={this.onBlur}
							placeholder="Comment"
							// minLength="30"
						/>
						{this.state.comment_error ? <span style={{color:"red"}}>{this.state.comment_error}</span> : null}
					</GrammarlyEditorPlugin>
				</div>
			);
		} else {
			return this.props.answer_comment ? <span> ( {this.props.answer_comment})</span> : null;
		}
	}
}

export default connect()(__AnswerComment);
