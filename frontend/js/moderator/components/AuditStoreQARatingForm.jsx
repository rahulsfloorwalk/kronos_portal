import React, { Component } from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";

import { findById, rate } from "../service/audit_store.js";

import FormErrorList from "../../components/FormErrorList.jsx";
import Modal from "../../components/Modal.jsx";

export default class AuditStoreQARatingForm extends Component {
	static propTypes = {
		params: PropTypes.shape({
			auditStoreId: PropTypes.string.isRequired,
		}),
		router: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			errors: {},
			selectedFeedback: [],
			rating: null,
			checkboxError: "",
		};
	}

	feedbackOptions = {
		0: [
			"Lacked in mandatory proofs",
			"Lacked sharing timely support",
			"Proofs & comments not aligned",
			"Not in line with guidelines"
		],
		1: [
			"Better quality proofs expected",
			"Avoid generic comments",
			"Sufficient feedback expected on findings",
			"Recommendations need more clarity"
		],
		2: [
			"Provided clear & relevant proofs",
			"Demonstrated good support",
			"Detailed & well-structured report",
			"Justified with the audit work"
		]
	};

	componentDidMount() {
		findById(this.props.params.auditStoreId).then(auditStore => {
			this.setState({
				auditStore,
				rating: auditStore && auditStore.qa_rating,
				selectedFeedback: auditStore && auditStore.qa_rating_feedback,
			});
		});
	}
	handleCheckboxChange = (feedback) => {
		const { selectedFeedback } = this.state;
		if (selectedFeedback && selectedFeedback.length > 0 && selectedFeedback.includes(feedback)) {
			this.setState({
				selectedFeedback: selectedFeedback.filter(f => f !== feedback),
			});
		} else {
			this.setState({
				selectedFeedback: [...selectedFeedback, feedback],
			});
		}
		this.setState({
			checkboxError: "",
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		if (this.state.rating == null) {
			this.setState({ checkboxError: "Please select Rating." });
			return;
		}
		if (this.state.selectedFeedback && this.state.selectedFeedback.length <= 0) {
			this.setState({ checkboxError: "Please select checkboxes." });
			return;
		}
		let promise = rate(this.props.params.auditStoreId, this.state.rating, this.state.selectedFeedback);
		promise.then(() => {
			this.props.router.goBack();
			Alert.success("RATING SAVED");
		}, (err) => {
			this.setState({
				errors: err.responseJSON,
			});
		});
	};

	render() {
		return (
			<Modal modalTitle="Rate Report" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors} />
					<div className="form-group">
						<label className="control-label">Report Quality Rating:</label>
						<div className="btn-group btn-group-justified">
							{["Bad", "Average", "Good"].map((label, index) => (
								<div className="btn-group" key={label}>
									<button
										type="button"
										className={`btn btn-lg btn-default ${this.state.rating === index ? "active" : ""
										}`}
										onClick={() =>
											this.setState({ rating: index, selectedFeedback: [], checkboxError: "" })
										}
									>
										{label}
									</button>
								</div>
							))}
						</div>
					</div>

					{this.state.rating !== null && (
						<div className="form-group">
							<label className="control-label">Select Feedback:</label>
							{this.feedbackOptions[this.state.rating].map((feedback, idx) => (
								<div className="checkbox" key={idx}>
									<label>
										<input
											type="checkbox"
											checked={this.state.selectedFeedback && this.state.selectedFeedback.length > 0 && this.state.selectedFeedback.includes(feedback)}
											onChange={() => this.handleCheckboxChange(feedback)}
										/>
										{feedback}
									</label>
								</div>
							))}
						</div>
					)}
					{this.state.checkboxError ? <p style={{ color: "red", fontWeight: "bold" }}>{this.state.checkboxError}</p> : null}
					<button className="btn btn-lg btn-primary">Save Rating</button>
				</form>
			</Modal>
		);
	}

}
