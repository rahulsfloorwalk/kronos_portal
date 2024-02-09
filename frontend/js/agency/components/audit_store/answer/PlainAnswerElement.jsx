import React from "react";
import PropTypes from "prop-types";
// import { GrammarlyEditorPlugin} from "@grammarly/editor-sdk-react";
// import { ClientID } from "../../../../constants.js";
export default class PlainAnswerElement extends React.Component {
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
				<textarea
					className="form-control"
					placeholder="type your answer here"
					name="answerText"
					value={this.props.answerText}
					onFocus={this.props.onFocus}
					onBlur={this.props.onBlur}
					onChange={this.props.onChange}
					ref={(input) => this.answerInput = input}
				></textarea>
			</form>;
		} else {
			return <p>{this.props.answerText}</p>;
		}
	}
}
