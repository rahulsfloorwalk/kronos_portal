import React, { Component } from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { findById, auditor_rate } from "../service/audit_store.js";

import FormErrorList from "../../components/FormErrorList.jsx";
import Modal from "../../components/Modal.jsx";

export default class AuditStoreAuditorRatingForm extends Component{
	static propTypes = {
		params: PropTypes.shape({
			auditStoreId: PropTypes.string.isRequired,
		}),
		router: PropTypes.object.isRequired,
	};

	constructor(props){
		super(props);
		this.state = {
			errors: {},
		};
	}

	componentDidMount(){
		findById(this.props.params.auditStoreId).then(auditStore => {
			this.setState({
				auditStore,
				rating: auditStore && auditStore.user.profileinfo.auditor_rating,
			});
		});
	}

	onSubmit = (e) => {
		e.preventDefault();
		let promise = auditor_rate(this.props.params.auditStoreId, this.state.rating);
		promise.then(()=>{
			this.props.router.goBack();
		}, (err)=>{
			this.setState({
				errors: err.responseJSON,
			});
		});
	};

	ratingSelected = (rating) => {
		this.setState({rating});
	};

	render(){
		return ( <Modal modalTitle="Rate Report" onClose={hashHistory.goBack}>
			<form onSubmit={this.onSubmit}>
				<FormErrorList errors={this.state.errors.non_field_errors}/>
				<div className="form-group">
					<label className="control-label">Auditor Rating:</label>
					<div className="btn-group btn-group-justified">
						<div className="btn-group">
							<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === "W" ? "active" : "")} onClick={() => this.ratingSelected("W")}>Worse</button>
						</div>
						<div className="btn-group">
							<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === "A" ? "active" : "")} onClick={() => this.ratingSelected("A")}>Average</button>
						</div>
						<div className="btn-group">
							<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === "G" ? "active" : "")} onClick={() => this.ratingSelected("G")}>Good</button>
						</div>
						<div className="btn-group">
							<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === "E" ? "active" : "")} onClick={() => this.ratingSelected("E")}>Excellent</button>
						</div>
					</div>
				</div>
				<button className="btn btn-lg btn-primary">Save Rating</button>
			</form>
		</Modal>);
	}
}
