import React, { Component } from "react";
import PropTypes from "prop-types";

import { connect } from "react-redux";

import { submitAnswerComment } from "../../../auditor/actions/answer.js";

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
	};

	static defaultProps = {
		editable: false,
	};

	constructor(props){
		super(props);
		this.state = {
			answer_comment: this.props.answer_comment || "",
		};
	}

	componentDidMount(){
		this.setState({ answer_comment: this.props.answer_comment, });
	}

	componentWillReceiveProps(nextProps){
		this.setState({ answer_comment: nextProps.answer_comment, });
	}

	commentChanged = (e) => {
		this.setState({
			answer_comment: e.target.value,
		});
	};

	onBlur = (e) => {
		this.commentChanged(e);
		this.props.dispatch(submitAnswerComment(this.props.audit_store_id, this.props.question_id, e.target.value));
	};

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

export default connect()(__AnswerComment);
