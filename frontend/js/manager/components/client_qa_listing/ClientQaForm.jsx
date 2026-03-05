import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { fetchClientModeratorToCheck, addClientModerator, fetchClientModeratorEdit, updateClientModerator } from "../../service/client_manager.js";
import { getInputEventChangeValue } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import FormErrorList from "../../../components/FormErrorList.jsx";

export default class ClientQaForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			clientId: PropTypes.string.isRequired,
			clientQaId: PropTypes.string,
		})
	};

	constructor(props) {
		super(props);
		this.state = {
			clientModerator: null,
			errors: {},
			form: {
				is_active: false,
				receive_email: false
			},
			loading: true,
			assignedQAs: [],
			moderators: [],
			submitting: false,
		};
	}



	onCheckboxChange = (qaId) => {
		this.setState((prevState) => ({
			assignedQAs: prevState.assignedQAs.includes(qaId)
				? prevState.assignedQAs.filter((id) => id !== qaId)
				: [...prevState.assignedQAs, qaId],
		}));
	};

	componentDidMount() {
		this.setState({
			"client": this.props.params.clientId
		});
		if (this.props.params.clientQaId) {
			fetchClientModeratorEdit(this.props.params.clientQaId).done((clientModerator) => {
				this.setState({
					clientModerator,
					form: {
						receive_email: clientModerator.receive_email_notification,
						is_active: clientModerator.is_active,
						moderator_email: clientModerator.user.email
					},
				});
			});
		}
		else {
			fetchClientModeratorToCheck(this.props.params.clientId)
				.done((moderators) => {
					const assignedIds = moderators
						.filter((qa) => qa.is_assigned)
						.map((qa) => qa.id);

					this.setState({
						moderators,
						assignedQAs: assignedIds,
						loading: false
					});
				})
				.fail(() => {
					this.setState({ loading: false });
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
		if (this.props.params.clientQaId) {
			promise = updateClientModerator({
				id: this.props.params.clientQaId,
				client: this.props.params.clientId,
				receive_email_notification: this.state.form.receive_email,
				is_active: this.state.form.is_active,
			});
		} else {
			promise = addClientModerator({
				client: this.props.params.clientId,
				moderator: this.state.assignedQAs,
				receive_email_notification: true,
				is_active: true,
			});
		}
		promise.done(() => {
			hashHistory.push(`/client/${this.props.params.clientId}/client_qa_listing`);
		}).fail((err) => {
			this.setState({
				errors: err.responseJSON || {},
			});
		});
	};

	render() {
		const { moderators, assignedQAs } = this.state;
		var modalTitle = this.props.params.clientQaId ? "Edit QA" : "Add QAs";

		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack} size={"modal-lg"}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors} />
					<p>
						<label>Moderators : </label>&nbsp;
					</p>
					{this.props.params.clientQaId ? <p>{this.state.form.moderator_email}</p> :
						<div className="row" style={{ paddingBottom: "3%" }}>
							{moderators &&
								moderators.length > 0 &&
								[...moderators]
									.sort((a, b) =>
										a.email.localeCompare(b.email)
									)
									.map((qa) => (
										<div className="col-sm-6 col-md-6" key={qa.id}>
											<label
												style={{
													fontSize: "14px",
													marginBottom: "10px",
													display: "flex",
													alignItems: "center",
												}}
											>
												<input
													type="checkbox"
													checked={assignedQAs.includes(qa.id)}
													onChange={() => this.onCheckboxChange(qa.id)}
													style={{
														width: "20px",
														height: "20px",
														marginRight: "8px",
													}}
												/>
												<span>{qa.email}</span>
											</label>
										</div>
									))}
						</div>}
					{this.props.params.clientQaId &&
						<>
							<FormInput label="Active :" type="checkbox" checked={this.state.form.is_active} name="is_active" onChange={this.fieldChanged} />
							<FormInput label="Receive Email :" type="checkbox" checked={this.state.form.receive_email} name="receive_email" onChange={this.fieldChanged} />
						</>}
					<SaveButton />
				</form>
			</Modal>
		);
	}
}