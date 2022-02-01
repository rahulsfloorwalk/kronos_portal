import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { fetchClientUser, addClientUser, updateClientUser } from "../../service/client_user.js";

import { getInputEventChangeValue } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import FormErrorList from "../../../components/FormErrorList.jsx";

export default class ClientUserForm extends React.Component{
	static propTypes = {
		params: PropTypes.shape({
			clientId: PropTypes.string.isRequired,
			clientUserId: PropTypes.string.isRequired,
		})
	};

	constructor(props){
		super(props);
		this.state = {
			clientUser: null,
			errors: {},
			form: {},
		};
	}
	componentDidMount() {
		this.setState({
			"client": this.props.params.clientId
		});
		if(this.props.params.clientUserId){
			fetchClientUser(this.props.params.clientUserId).done((clientUser)=>{
				this.setState({
					clientUser,
					form: {
						full_name : clientUser.full_name,
						email : clientUser.user.email,
						is_active : clientUser.user.is_active,
						receive_email_notification: clientUser.receive_email_notification,
						is_client_admin : clientUser.is_client_admin,
						password : "",
					},
				});
			});
		}
	}

	fieldChanged = (e) => {
		this.setState({
			form: Object.assign({}, this.state.form, getInputEventChangeValue(e)),
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		let promise;
		if(this.props.params.clientUserId){
			promise = updateClientUser({
				id : this.props.params.clientUserId,
				client: this.props.params.clientId,
				full_name : this.state.form.full_name,
				email : this.state.form.email,
				is_active : this.state.form.is_active,
				receive_email_notification : this.state.form.receive_email_notification,
				is_client_admin : this.state.form.is_client_admin,
				password : this.state.form.password,
			});
		} else {
			promise = addClientUser({
				client: this.props.params.clientId,
				full_name : this.state.form.full_name,
				email : this.state.form.email,
				is_active : this.state.form.is_active,
				receive_email_notification : this.state.form.receive_email_notification,
				is_client_admin : this.state.form.is_client_admin,
				password : this.state.form.password,
			});
		}
		promise.done((savedClientUser)=>{
			hashHistory.push(`/client/${savedClientUser.client}/client_user`);
		}).fail((err)=>{
			this.setState({
				errors: err.responseJSON || {},
			});
		});
	};

	render(){
		var modalTitle = this.props.params.clientUserId ? "Edit Client User" : "Add Client User";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<FormInput label="Full Name" type="text" value={this.state.form.full_name} name="full_name" onChange={this.fieldChanged} errors={this.state.errors.full_name}/>
					<FormInput label="Email Address" type="email" value={this.state.form.email} name="email" onChange={this.fieldChanged} errors={this.state.errors.email}/>
					<FormInput label="Password" type="text" value={this.state.form.password} name="password" onChange={this.fieldChanged} errors={this.state.errors.password} placeholder="leave blank to keep password unchanged"/>
					<FormInput label="Admin?" type="checkbox" checked={this.state.form.is_client_admin} name="is_client_admin" onChange={this.fieldChanged} errors={this.state.errors.is_client_admin}/>
					<FormInput label="Active?" type="checkbox" checked={this.state.form.is_active} name="is_active" onChange={this.fieldChanged} errors={this.state.errors.is_active}/>
					<FormInput label="Receive Email Notification?" type="checkbox" checked={this.state.form.receive_email_notification} name="receive_email_notification" onChange={this.fieldChanged} errors={this.state.errors.receive_email_notification}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	}
}
