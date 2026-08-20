import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";

import { fetchClient, addClient, updateClient } from "../../service/client.js";

import { getInputEventChangeValue } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import "../../../../css/bs_overrides.scss";

export default class extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			clientId: PropTypes.string,
		}),
	};

	state = {
		client: null,
		errors: {},
		form: {
			score_scale: {
				excellent: "",
				good: "",
				average: "",
				poor: "",
			},
		},
		saving: false,
	};

	componentDidMount() {
		if(this.props.params.clientId){
			fetchClient(this.props.params.clientId).done((client)=>{
				this.setState({
					client,
					form: {
						name: client.name,
						brand_name: client.brand_name,
						email: client.email,
						phone: client.phone,
						primary_color: client.primary_color,
						secondary_color: client.secondary_color,
						background_image_url: client.background_image_url,
						logo_url: client.logo_url,
						brand_logo_url: client.brand_logo_url,
						score_scale: client.score_scale || {
							excellent: "",
							good: "",
							average: "",
							poor: "",
						},
						receive_email_notification: client.receive_email_notification,
					},
				});
			});
		}
	}

	inputChanged = (e) => {
		this.setState({
			form: Object.assign({}, this.state.form, getInputEventChangeValue(e)),
		});
	};

	scoreScaleChanged = (e) => {
		const { name, value } = e.target;

		this.setState((prevState) => ({
			form: {
				...prevState.form,
				score_scale: {
					...prevState.form.score_scale,
					[name]: value,
				},
			},
		}));
	};

	onSubmit = (e) => {
		e.preventDefault();
		if (this.state.saving) {
			return;
		}
		this.setState({ saving: true });
		let submitPromise;
		if(this.props.params.clientId){
			submitPromise = updateClient({
				id: this.props.params.clientId,
				name: this.state.form.name,
				brand_name: this.state.form.brand_name,
				email: this.state.form.email,
				phone: this.state.form.phone,
				primary_color: this.state.form.primary_color,
				secondary_color: this.state.form.secondary_color,
				background_image_url: this.state.form.background_image_url,
				logo_url: this.state.form.logo_url,
				brand_logo_url: this.state.form.brand_logo_url,
				score_scale: this.state.form.score_scale,
				receive_email_notification: this.state.form.receive_email_notification,
			});
		} else {
			submitPromise = addClient({
				name: this.state.form.name,
				brand_name: this.state.form.brand_name,
				email: this.state.form.email,
				phone: this.state.form.phone,
				primary_color: this.state.form.primary_color,
				secondary_color: this.state.form.secondary_color,
				background_image_url: this.state.form.background_image_url,
				logo_url: this.state.form.logo_url,
				brand_logo_url: this.state.form.brand_logo_url,
				score_scale: this.state.form.score_scale,
				receive_email_notification: this.state.form.receive_email_notification,
			});
		}
		submitPromise.done(function(savedClient){
			hashHistory.push(`/client/${savedClient.id}/audit_cycle`);
			Alert.success("CLIENT SAVED");
		}).fail((err)=>{
			this.setState({
				errors: err.responseJSON || {},
			});
			if (!err.responseJSON && err.status >= 500) {
				Alert.error("Server error");
			} else if (!err.responseJSON) {
				Alert.error("Error saving client, Please try again after sometime");
			}
		}).always(() => {
			this.setState({ saving: false });
		});
	};

	render() {
		var modalTitle = this.props.params.clientId ? "Edit Client" : "Add Client";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormInput label="Client Name" maxLength="50" type="text" value={this.state.form.name} name="name" onChange={this.inputChanged} errors={this.state.errors.name}/>
					<FormInput label="Brand Name" maxLength="50" type="text" value={this.state.form.brand_name} name="brand_name" onChange={this.inputChanged} errors={this.state.errors.brand_name}/>
					<FormInput label="Email Address" maxLength="50" type="email" value={this.state.form.email} name="email" onChange={this.inputChanged} errors={this.state.errors.email}/>
					<FormInput label="Phone Number" maxLength="15" type="text" value={this.state.form.phone} name="phone" onChange={this.inputChanged} errors={this.state.errors.phone}/>
					<FormInput label="Primary Color (e.g. #FF0000 or rgb(255, 0, 0) or red)" maxLength="15" type="text" value={this.state.form.primary_color} name="primary_color" onChange={this.inputChanged} errors={this.state.errors.primary_color}/>
					<FormInput label="Secondary Color (e.g. #FF0000 or rgb(255, 0, 0) or red)" maxLength="15" type="text" value={this.state.form.secondary_color} name="secondary_color" onChange={this.inputChanged} errors={this.state.errors.secondary_color}/>
					<FormInput label="Background Image URL" maxLength="512" type="text" value={this.state.form.background_image_url} name="background_image_url" onChange={this.inputChanged} errors={this.state.errors.background_image_url}/>
					<FormInput label="Logo URL" maxLength="512" type="text" value={this.state.form.logo_url} name="logo_url" onChange={this.inputChanged} errors={this.state.errors.logo_url}/>
					<FormInput label="Brand Logo URL" maxLength="512" type="text" value={this.state.form.brand_logo_url} name="brand_logo_url" onChange={this.inputChanged} errors={this.state.errors.brand_logo_url}/>
					<div className="store-scale-section">
						<h4>Store Score Scale</h4>
						<p className="help-text">
							Define the score range for each performance level.
						</p>

						<FormInput
							label="Excellent"
							placeholder="e.g. 90 to 95"
							type="text"
							name="excellent"
							value={(this.state.form.score_scale || {}).excellent}
							onChange={this.scoreScaleChanged}
						/>

						<FormInput
							label="Good"
							placeholder="e.g. 80 to 89"
							type="text"
							name="good"
							value={(this.state.form.score_scale || {}).good}
							onChange={this.scoreScaleChanged}
						/>

						<FormInput
							label="Average"
							placeholder="e.g. 70 to 79"
							type="text"
							name="average"
							value={(this.state.form.score_scale || {}).average}
							onChange={this.scoreScaleChanged}
						/>

						<FormInput
							label="Poor"
							placeholder="e.g. 0 to 69"
							type="text"
							name="poor"
							value={(this.state.form.score_scale || {}).poor}
							onChange={this.scoreScaleChanged}
						/>
					</div>
					<FormInput label="Receive Email Notification" type="checkbox" checked={this.state.form.receive_email_notification} name="receive_email_notification" onChange={this.inputChanged} errors={this.state.errors.receive_email_notification}/>
					{/* <SaveButton/> */}
					<SaveButton disabled={this.state.saving} text={this.state.saving ? "Saving..." : "Save"} />
				</form>
			</Modal>
		);
	}
}
