
import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import Alert from "react-s-alert";

import Modal from "../../../components/Modal.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import FormErrorList from "../../../components/FormErrorList.jsx";

import {fetchClientDashboardVisibility,updateClientDashboardVisibility} from "../../service/client_manager.js";

const DASHBOARD_ITEMS = [
	{
		key: "latest_audit_cycle_score",
		label: "Latest Audit Cycle Score",
	},
	{
		key: "upcoming_audits",
		label: "Upcoming Audits",
	},
	{
		key: "net_promoter_score",
		label: "Net Promoter Score",
	},
	{
		key: "section_summary",
		label: "Section Summary",
	},
	{
		key: "improvement_areas_based_on_observation",
		label: "Improvement areas based on observation",
	},
	{
		key: "overall_high_performance_store",
		label: "Overall High Performance Store",
	},
	{
		key: "overall_high_performance_city",
		label: "Overall High Performance City",
	},
	{
		key: "branch_performance",
		label: "Branch performance",
	},
	{
		key: "overall_low_performance_store",
		label: "Overall Low Performance Store",
	},
	{
		key: "overall_low_performance_city",
		label: "Overall Low Performance City",
	},
	{
		key: "questionnaire_summary",
		label: "Questionnaire Summary",
	},
];

const DEFAULT_VISIBILITY = DASHBOARD_ITEMS.reduce((acc, item) => {
	acc[item.key] = true;
	return acc;
}, {});

export default class ClientDashboardVisibilityForm extends React.Component {
		static propTypes = {
			params: PropTypes.shape({
				clientId: PropTypes.string.isRequired,
			}),
		};

		constructor(props) {
			super(props);

			this.state = {
				loading: true,
				submitting: false,
				errors: {},

				form: DEFAULT_VISIBILITY,
			};
		}

		componentDidMount() {

			fetchClientDashboardVisibility(this.props.params.clientId)
				.done((response) => {

					const form = { ...DEFAULT_VISIBILITY };

					DASHBOARD_ITEMS.forEach((item) => {
						if (response && response[item.key] !== undefined) {
							form[item.key] = response[item.key];
						}
					});

					this.setState({
						loading: false,
						form,
					});

				})
				.fail(() => {
					this.setState({
						loading: false,
					});
				});
		}

		onCheckboxChange = (key) => {

			this.setState((prevState) => ({
				form: {
					...prevState.form,
					[key]: !prevState.form[key],
				},
			}));

		};

		onSubmit = (e) => {

			e.preventDefault();

			if (this.state.submitting) {
				return;
			}

			this.setState({
				submitting: true,
			});

			updateClientDashboardVisibility(
				this.props.params.clientId,
				this.state.form
			)
				.done(() => {
					Alert.success( "Updated Successfully");
					hashHistory.push(
						`/client/${this.props.params.clientId}/client_dashboard_visibility`
					);

				})
				.fail((err) => {

					this.setState({
						errors: err.responseJSON || {},
					});

					Alert.error(
						(err.responseJSON && err.responseJSON.non_field_errors && err.responseJSON.non_field_errors[0])
							|| "Failed to update dashboard visibility. Please try again."
					);

				})
				.always(() => {

					this.setState({
						submitting: false,
					});

				});

		};

		render() {

			if (this.state.loading) {
				return (
					<Modal
						modalTitle="Dashboard Visibility"
						onClose={hashHistory.goBack}
					>
						<p>Loading...</p>
					</Modal>
				);
			}

			const form = this.state.form;

			return (
				<Modal
					modalTitle="Edit Dashboard Visibility"
					onClose={hashHistory.goBack}
					size="modal-md"
				>
					<form onSubmit={this.onSubmit}>

						<FormErrorList
							errors={this.state.errors.non_field_errors}
						/>

						<div
							style={{
								border: "1px solid #ddd",
								borderRadius: "4px",
								padding: "20px",
								marginBottom: "20px",
								background: "#fafafa",
							}}
						>

							<h4
								style={{
									marginTop: 0,
									marginBottom: "5px",
								}}
							>
								Dashboard Widgets
							</h4>

							<p
								style={{
									color: "#777",
									marginBottom: "20px",
								}}
							>
								Select which widgets should be visible on the client dashboard.
							</p>

							<div className="row">

								{DASHBOARD_ITEMS.map((item) => (

									<div
										className="col-sm-6"
										key={item.key}
										style={{
											marginBottom: "15px",
										}}
									>

										<label
											style={{
												display: "flex",
												alignItems: "flex-start",
												cursor: "pointer",
											}}
										>
											<input
												type="checkbox"
												checked={form[item.key]}
												onChange={() => this.onCheckboxChange(item.key)}
												style={{
													width: "18px",
													height: "18px",
													marginRight: "10px",
													marginTop: "3px",
													flexShrink: 0,
												}}
											/>

											<span>{item.label}</span>
										</label>

									</div>

								))}

							</div>

						</div>

						<div
							style={{
								textAlign: "right",
							}}
						>
							<SaveButton
								disabled={this.state.submitting}
								text={
									this.state.submitting
										? "Saving..."
										: "Save"
								}
							/>
						</div>

					</form>
				</Modal>
			);
		}
}