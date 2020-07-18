import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { fetchClientManager, addClientManager, updateClientManager } from "../../service/client_manager.js";

import {findManagers} from "../../service/manager.js";

import { getInputEventChangeValue } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import FormErrorList from "../../../components/FormErrorList.jsx";

export default class ClientManagerForm extends React.Component{
	static propTypes = {
		params: PropTypes.shape({
			clientId: PropTypes.string.isRequired,
			clientManagerId: PropTypes.string,
		})
	};

	constructor(props){
		super(props);
		this.state = {
			clientManager: null,
			errors: {},
			form: {
				is_active: false,
				receive_email: false
			},
			managerList: [],
		};
	}
	componentDidMount() {
		this.setState({
			"client": this.props.params.clientId
		});
		if(this.props.params.clientManagerId){
			fetchClientManager(this.props.params.clientManagerId).done((clientManager)=>{
				this.setState({
					clientManager,
					form: {
						receive_email: clientManager.receive_email_notification,
						is_active: clientManager.is_active,
						manager_email: clientManager.user.email
					},
				});
			});
		}
		else{
			findManagers().then((managers) => {
				this.setState({
					managerList: managers
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
		if(this.props.params.clientManagerId){
			promise = updateClientManager({
				id : this.props.params.clientManagerId,
				client: this.props.params.clientId,
				receive_email_notification: this.state.form.receive_email,
				is_active: this.state.form.is_active,
			});
		} else {
			promise = addClientManager({
				client: this.props.params.clientId,
				manager: this.state.form.manager_id,
				receive_email_notification: this.state.form.receive_email,
				is_active: this.state.form.is_active,
			});
		}
		promise.done((savedClientManager)=>{
			hashHistory.push(`/client/${savedClientManager.client}/client_manager`);
		}).fail((err)=>{
			this.setState({
				errors: err.responseJSON || {},
			});
		});
	};

	render(){
		var modalTitle = this.props.params.clientManagerId ? "Edit Manager" : "Add Manager";
		let manageOptionList;
		if (this.state.managerList){
			manageOptionList = this.state.managerList.map((m)=> <option key={m.id} value={m.id}>{m.email}</option>);
		}
		let selectBoxElement;
		if (this.props.params.clientManagerId){
			selectBoxElement = (<label>{this.state.form.manager_email}</label>);
		}
		else{
			selectBoxElement = (
				<select className="form-control" name="manager_id" value={this.state.form.manager_id} onChange={this.fieldChanged}>
					<option value="">Select Manager</option>
					{manageOptionList}
				</select>
			);
		}

		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<p>
						<label>Manager : </label>&nbsp;
						{selectBoxElement}
					</p>
					<FormInput label="Active :" type="checkbox" checked={this.state.form.is_active} name="is_active" onChange={this.fieldChanged}/>
					<FormInput label="Receive Email :" type="checkbox" checked={this.state.form.receive_email} name="receive_email" onChange={this.fieldChanged}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	}
}
