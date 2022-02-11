import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { fetchClientTrainer, addClientTrainer, updateClientTrainer } from "../../service/client_trainer.js";

import {findTrainers} from "../../service/trainer.js";

import { getInputEventChangeValue } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import FormErrorList from "../../../components/FormErrorList.jsx";

export default class ClientTrainerForm extends React.Component{
	static propTypes = {
		params: PropTypes.shape({
			clientId: PropTypes.string.isRequired,
			clientTrainerId: PropTypes.string,
		})
	};

	constructor(props){
		super(props);
		this.state = {
			clientTrainer: null,
			errors: {},
			form: {
				is_active: false,
				receive_email: false
			},
			trainerList: [],
		};
	}
	componentDidMount() {
		this.setState({
			"client": this.props.params.clientId
		});
		if(this.props.params.clientTrainerId){
			fetchClientTrainer(this.props.params.clientTrainerId).done((clientTrainer)=>{
				this.setState({
					clientTrainer,
					form: {
						receive_email: clientTrainer.receive_email_notification,
						is_active: clientTrainer.is_active,
						trainer_email: clientTrainer.user.email
					},
				});
			});
		}
		else{
			findTrainers().then((trainers) => {
				this.setState({
					trainerList: trainers
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
		if(this.props.params.clientTrainerId){
			promise = updateClientTrainer({
				id : this.props.params.clientTrainerId,
				client: this.props.params.clientId,
				receive_email_notification: this.state.form.receive_email,
				is_active: this.state.form.is_active,
			});
		} else {
			promise = addClientTrainer({
				client: this.props.params.clientId,
				trainer: this.state.form.trainer_id,
				receive_email_notification: this.state.form.receive_email,
				is_active: this.state.form.is_active,
			});
		}
		promise.done((savedClientTrainer)=>{
			hashHistory.push(`/client/${savedClientTrainer.client}/client_trainer`);
		}).fail((err)=>{
			this.setState({
				errors: err.responseJSON || {},
			});
		});
	};

	render(){
		var modalTitle = this.props.params.clientTrainerId ? "Edit Trainer" : "Add Trainer";
		let trainerOptionList;
		let selectBoxElement;
		if (this.props.params.clientTrainerId){
			selectBoxElement = (<label>{this.state.form.trainer_email}</label>);
		}
		else{
			if (this.state.trainerList){
				trainerOptionList = this.state.trainerList.map((m)=>
				{	return m.is_active === true ?
					<option key={m.id} value={m.id}>{m.email}</option>
					: null;
				}
				);
			}
			selectBoxElement = (
				<select className="form-control" name="trainer_id" value={this.state.form.trainer_id} onChange={this.fieldChanged}>
					<option value="">Select Trainer</option>
					{trainerOptionList}
				</select>
			);
		}

		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<p>
						<label>Trainer : </label>&nbsp;
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
