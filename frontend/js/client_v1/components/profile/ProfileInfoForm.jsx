import React from "react";
import { hashHistory } from "react-router";
import Alert from "react-s-alert";
import FormInput from "../../../components/FormInput.jsx";

import Modal from "../../../components/Modal.jsx";
import SaveButton from "../../../components/SaveButton.jsx";

import { updateClient, fetchClient } from "../../service/client.js";

import Loading from "../../../components/Loading.jsx";

import { getInputEventChangeValue } from "../../../react_utils.js";

export default class ProfileInfoForm extends React.Component {

	state = {
		client: "",
		form: {},
		errors: {}
	};

	componentDidMount() {
		fetchClient().then((client)=>{
			this.setState({
				client,
				form: {
					name: client.name,
					email: client.email,
					phone: client.phone,
					company_website_url: client.company_website_url,
					address: client.address,
				},
			});
		});
	}

	inputChanged = (e) => {
		this.setState({
			form: Object.assign({}, this.state.form, getInputEventChangeValue(e)),
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		updateClient({
			id: this.state.client.id,
			name: this.state.form.name,
			email: this.state.form.email,
			phone: this.state.form.phone,
			company_website_url: this.state.form.company_website_url,
			address: this.state.form.address,
		}).done(function(){
			hashHistory.push("/profile");
			Alert.success("CLIENT SAVED");
		}).fail((err)=>{
			this.setState({
				errors: err.responseJSON || {},
			});
		});
	};

	render() {
		if(! this.state.client){
			return <Loading/>;
		}
		return (
			<Modal modalTitle="Edit Profile Info" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormInput label="Name" name="name" value={this.state.form.name} onChange={this.inputChanged} />
					{/* <FormInput label="Email" name="email" value={this.state.form.email} onChange={this.inputChanged} />
					<FormInput label="Phone no." name="phone" value={this.state.form.phone} onChange={this.inputChanged} errors={this.state.errors.phone} /> */}
					<FormInput label="Ho. Address" name="address" value={this.state.form.address} onChange={this.inputChanged} />
					<FormInput label="Company Website URL" name="company_website_url" value={this.state.form.company_website_url} onChange={this.inputChanged} errors={this.state.errors.company_website_url} />
					<SaveButton/>
				</form>
			</Modal>
		);
	}
}