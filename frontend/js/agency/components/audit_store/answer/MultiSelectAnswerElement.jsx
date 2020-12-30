import React from "react";
import PropTypes from "prop-types";

import AnswerComment from "./AnswerComment.jsx";

export default class MultiSelectAnswerElement extends React.Component {
	static propTypes = {
		auditStoreId: PropTypes.number.isRequired,
		questionId: PropTypes.number.isRequired,

		editable: PropTypes.bool.isRequired,

		answer: PropTypes.object,
		answerText: PropTypes.string.isRequired,
		onClick: PropTypes.func.isRequired,

		options: PropTypes.arrayOf(PropTypes.shape({
			sequence: PropTypes.number.isRequired,
			value: PropTypes.string.isRequired,
		})).isRequired,
	};
	render(){
		let checkbox_list = [];
		let multiselect_answer_list = [];
		if(this.props.answer){
			multiselect_answer_list = this.props.answer.get_answer_text_list;
		}
		for(let o of this.props.options){
			if(multiselect_answer_list.includes(o.value)){
				checkbox_list.push(<label style={{fontSize:"14px",marginBottom:"10px"}} key={o.sequence}><input type="checkbox" value={o.value} name="answer_text" onClick={this.props.onClick} defaultChecked style={{verticalAlign:"bottom",width:"20px",height:"20px"}} /><span> {o.value}</span>&nbsp;</label>);
			}
			else{
				checkbox_list.push(<label style={{fontSize:"14px",marginBottom:"10px"}} key={o.sequence}><input type="checkbox" value={o.value} name="answer_text" onClick={this.props.onClick} style={{verticalAlign:"bottom",width:"20px",height:"20px"}} /><span> {o.value}</span>&nbsp;</label>);
			}
		}

		if(this.props.editable){
			return <div className="row">
				<div className="col-xs-5">
					{checkbox_list}
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
			// let answerText = (this.props.answerText).replaceAll(";", ", ");
			let answerText = this.props.answerText;
			if(answerText === ""){
				answerText = "No answer selected";
			}
			return (<p>
				{answerText}
				<AnswerComment
					auditStoreId={this.props.auditStoreId}
					questionId={this.props.questionId}
				/>
			</p>);
		}
	}
}
