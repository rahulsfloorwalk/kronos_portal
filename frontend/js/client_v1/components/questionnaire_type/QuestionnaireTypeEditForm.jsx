import React, { Component } from "react";
import PropTypes from "prop-types";

import Alert from "react-s-alert";

import { __QuestionnaireTypeForm } from "./QuestionnaireTypeForm.jsx";
import { fetchQuestionnaireType, saveQuestionnaireType } from "../../service/questionnaire_type.js";

export default class QuestionnaireTypeEditForm extends Component{
	static propTypes = {
		params: PropTypes.shape({
			clientId: PropTypes.string.isRequired,
			questionnaireTypeId: PropTypes.string.isRequired,
		}).isRequired,
		router: PropTypes.object.isRequired,
	};

	state = {};
	componentDidMount(){
		fetchQuestionnaireType(this.props.params.questionnaireTypeId).then(questionnaireType => {
			this.setState({
				questionnaireType,
			});
		});
	}

	onSubmit = (questionnaireType) => {
		saveQuestionnaireType(
			parseInt(this.props.params.questionnaireTypeId),
			questionnaireType.name,
			parseInt(this.props.params.clientId),
			questionnaireType.is_default,
		).then(() => {
			this.props.router.push(`/projects/${this.props.params.clientId}/questionnaire_type`);
			Alert.success("QUESTIONNAIRE TYPE SAVED");
		}, (err) => {
			this.setState({
				errors: err.responseJSON || {},
			});
		});
	};

	render(){
		if(this.state.questionnaireType){
			const initialValues = {
				name: this.state.questionnaireType.name,
				is_default: this.state.questionnaireType.is_default,
			};
			return <__QuestionnaireTypeForm
				initialValues={initialValues}
				onSubmit={this.onSubmit}
				onClose={this.props.router.goBack}
				errors={this.state.errors}
			/>;
		} else {
			return null;
		}
	}
}
