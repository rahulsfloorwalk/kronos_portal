import React, { Component } from "react";
import PropTypes from "prop-types";

import { connect } from "react-redux";
import { GrammarlyEditorPlugin} from "@grammarly/editor-sdk-react";
import { ClientID } from "../../../../constants.js";
import { setAnswerComment } from "../../../actions/answer.js";
import { findAnswer } from "../../../reducers/answer.js";
import { findAuditStore } from "../../../reducers/audit_store.js";

export class __AnswerComment extends Component {

	static propTypes = {
		answerComment: PropTypes.string.isRequired,
		onChange: PropTypes.func.isRequired,
		editable: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		editable: false,
		answerComment: "",
	};

	state = {
		answerComment: "",
	};

	componentDidMount(){
		this.setState({ answerComment: this.props.answerComment, });
	}

	componentWillReceiveProps(nextProps){
		this.setState({ answerComment: nextProps.answerComment, });
	}

	commentChanged = (e) => {
		this.setState({
			answerComment: e.target.value,
		});
	};

	onBlur = (e) => {
		this.commentChanged(e);
		if( this.props.answerComment !== this.state.answerComment){
			this.props.onChange(e.target.value);
		}
	};

	render(){
		if(this.props.editable){
			return (
				<GrammarlyEditorPlugin clientId={ClientID}>
					<input className="form-control" value={this.state.answerComment} onChange={this.commentChanged} onBlur={this.onBlur} placeholder="optional comment"/>
				</GrammarlyEditorPlugin>
			);
		} else {
			return this.props.answerComment ? <span> ( {this.props.answerComment})</span> : null;
		}
	}
}

const mapStoreToProps = (store, ownProps) => {
	const answer = findAnswer(store, ownProps.auditStoreId, ownProps.questionId);
	const auditStore = findAuditStore(store, ownProps.auditStoreId);
	return {
		answerComment: answer && answer.answer_comment,
		editable: auditStore && auditStore.is_editable_by_agency,
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		onChange: (answerComment) => dispatch(setAnswerComment(ownProps.auditStoreId, ownProps.questionId, answerComment)),
	};
};

const AnswerComment = connect(mapStoreToProps, mapDispatchToProps)(__AnswerComment);

AnswerComment.propTypes = {
	auditStoreId: PropTypes.number.isRequired,
	questionId: PropTypes.number.isRequired,
};

export default AnswerComment;
