import React, { Component } from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";

import { setWhatsappNumber } from "../actions/profile_info.js";

import { affectInputEventToComponent } from "../../react_utils.js";
import FormInput from "../../components/FormInput.jsx";
import { Save } from "../../components/Icons.jsx";
import FormErrorList from "../../components/FormErrorList.jsx";
import Modal from "../../components/Modal.jsx";


class WhatsappNumberForm extends Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		router: PropTypes.shape({
			push: PropTypes.func.isRequired,
			goBack: PropTypes.func.isRequired,
		}).isRequired,
	};

	constructor(props){
		super(props);
		this.state = {
			whatsapp_number: "",
			submitting: false,
			errors: {},
		};
	}

	setSubmitting = (submitting) => {
		this.setState((prevState) => Object.assign({}, prevState, { submitting }));
	};

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.setSubmitting(true);
		this.props.dispatch(setWhatsappNumber(this.state.whatsapp_number)).then(() => {
			this.props.router.push("/details");
		}, (err) => {
			this.setState({
				errors: err && err.responseJSON,
			});
		}).always(() => this.setSubmitting(false));
	};

	render(){
		return (
			<Modal modalTitle="Update Whatsapp Number" onClose={this.props.router.goBack}>
				<form onSubmit={this.onSubmit}>
					{typeof(this.state.errors.non_field_errors) != "undefined" ? <FormErrorList errors={this.state.errors.non_field_errors}/> : null }
					<FormInput label="Whatsapp Number (10-digit)" placeholder="__________"
						maxLength="10" type="text" required={true}
						value={this.state.whatsapp_number}
						name="whatsapp_number" onChange={this.inputChanged}
						errors={this.state.errors.whatsapp_number}
						disabled={this.state.submitting}/>
					<div className="form-group">
						<button className="btn btn-lg btn-primary" disabled={this.state.submitting}>
							{ !this.state.submitting ? <span><Save/> Save</span> : "saving..."}
						</button>
					</div>
				</form>
			</Modal>
		);
	}
}

export default ReactRedux.connect()(WhatsappNumberForm);
