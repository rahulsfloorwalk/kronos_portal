import React, { Component } from "react";

import Modal from "../../components/Modal.jsx";
import FormInput from "../../components/FormInput.jsx";
import SaveButton from "../../components/SaveButton.jsx";
import { hashHistory } from "react-router";
import { getEmailNotification, saveEmailNotification } from "../service/user.js";
import Loading from "../../components/Loading.jsx";

class EmailNotification extends Component {

	state = {
		receive_email_notification: null,
		client_email: null,
		loading: false
	};

	setLoading = (loading) => {
		this.setState(prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	};

	componentDidMount() {
		this.setLoading(true);
		getEmailNotification().then((client)=>{
			this.setState({
				receive_email_notification: client.receive_email_notification,
				client_email: client.email
			});
		}).always(() => this.setLoading(false));
	}

	inputChanged = (e) => {
		this.setState({
			receive_email_notification: e.target.checked,
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		saveEmailNotification(this.state.receive_email_notification)
			.then(() => {
				hashHistory.goBack();
			});
	};

	render() {
		let formElement;
		var modalTitle = "Receive Email Notification";
		var modalSize = "modal-sm";

		if(this.state.loading){
			formElement = <Loading/>;
		}

		if(this.state.client_email){
			let clientEmail;

			clientEmail = `Do you want to receive email notification on ${this.state.client_email}?`;

			formElement = (
				<form onSubmit={this.onSubmit}>
					<FormInput label={clientEmail} type="checkbox" checked={this.state.receive_email_notification} name="receive_email_notification" onChange={this.inputChanged}/>
					<SaveButton/>
				</form>
			);
		}
		return (
			<div>
				<Modal modalTitle={modalTitle} modalSize={modalSize} onClose={hashHistory.goBack}>
					{formElement}
				</Modal>
			</div>
		);
	}
}

export default EmailNotification;