import React, { Component } from "react";
import PropTypes from "prop-types";

import Alert from "react-s-alert";

import { getInputEventChangeValue } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import FormErrorList from "../../../components/FormErrorList.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";

import Checkbox from "../../../components/Checkbox.jsx";

import { createQuestionnaireType } from "../../service/questionnaire_type.js";

export class __QuestionnaireTypeForm extends Component{
	static propTypes = {
		onSubmit: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,

		errors: PropTypes.object.isRequired,

		initialValues: PropTypes.shape({
			name: PropTypes.string,
			is_default: PropTypes.bool,
		}),
	};

	static defaultProps = {
		onSubmit: () => {},
		onClose: () => {},
		errors: {},
		initialValues: {
			name: "",
			is_default: false,
		},
	};

	constructor(props){
		super(props);
		this.state = {
			values: props.initialValues,
		};
	}

	inputChanged = (e) => {
		this.setState({
			values: Object.assign({}, this.state.values, getInputEventChangeValue(e)),
		});
	};

	setIsDefault = (is_default) => {
		this.setState(prevState => Object.assign({}, prevState, {
			values: Object.assign({}, this.state.values, { is_default }),
		}));
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.props.onSubmit({
			name: this.state.values.name,
			is_default: this.state.values.is_default,
		});
	};

	render(){
		const modalTitle = "Add Questionnaire Type";
		return (
			<Modal modalTitle={modalTitle} onClose={this.props.onClose}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					<div className="form-group">
						<FormInput label="Name" type="text" value={this.state.values.name} name="name" onChange={this.inputChanged} errors={this.props.errors.name}/>
					</div>
					<div className="form-group">
						<Checkbox checked={this.state.values.is_default} name="is_default" onChange={this.setIsDefault}/>
						&nbsp;
						<label>Default</label>
					</div>
					<SaveButton/>
				</form>
			</Modal>
		);
	}
}

export default class QuestionnaireTypeForm extends Component{
	static propTypes = {
		params: PropTypes.shape({
			clientId: PropTypes.string,
		}).isRequired,
		router: PropTypes.object.isRequired,
	};

	state = {};

	onSubmit = (questionnaireType) => {
		createQuestionnaireType(
			questionnaireType.name,
			parseInt(this.props.params.clientId),
			questionnaireType.is_default,
		).then(() => {
			this.props.router.push(`/client/${this.props.params.clientId}/questionnaire_type`);
			Alert.success("QUESTIONNAIRE TYPE SAVED");
		}, (err) => {
			this.setState({
				errors: err.responseJSON || {},
			});
		});
	};

	render(){
		return <__QuestionnaireTypeForm
			onSubmit={this.onSubmit}
			onClose={this.props.router.goBack}
			errors={this.state.errors}
		/>;
	}
}
