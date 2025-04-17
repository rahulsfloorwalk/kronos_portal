import React, { Component } from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { failReport } from "../service/audit_store.js";

import FormErrorList from "../../components/FormErrorList.jsx";
import FormTextarea from "../../components/FormTextarea.jsx";
import Modal from "../../components/Modal.jsx";

export default class ReportFail extends Component {
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
			message: "",
			errormsg: "",
			successMessage: "",
			isDisabled: false,
		};
	}

	onSubmit = (e) => {
		e.preventDefault();
		if (this.state.message === "") {
			this.setState({ errormsg: "Text field can't be empty" });
			return;
		}
		this.setState({ isDisabled: true });
		let promise = failReport(this.props.params.auditStoreId, this.state.message);
		promise.then(() => {
			this.setState({
				successMessage: "Audit Report Failed successfully",
				message: ""
			});
			setTimeout(() => {
				this.props.router.goBack();
			}, 1200);
		}, (err) => {
			this.setState({
				errors: err.responseJSON,
				isDisabled: false,
			});
		});
	};

	fieldChanged = (e) => {
		this.setState({
			message: e.target.value,
			errormsg: "",
		});
	};

	render() {
		return (<Modal modalTitle="Fail Report" onClose={hashHistory.goBack}>
			<form onSubmit={this.onSubmit}>
				<FormErrorList errors={this.state.errors.non_field_errors} />
				<p style={{ color: "green", fontWeight: "bold", textAlign: "center", fontSize: "2rem" }}>{this.state.successMessage}</p>
				<div className="form-group">
					<FormTextarea label="Why are you failing this report?" value={this.state.message} name="message" onChange={this.fieldChanged} disabled={this.state.isDisabled} />
				</div>
				{this.state.errormsg ? <p style={{ color: "red", fontWeight: "bold" }}>{this.state.errormsg}</p> : null}
				<button className="btn btn-lg btn-primary" disabled={this.state.isDisabled}>Submit</button>
			</form>
		</Modal>);
	}
}