import React, { Component } from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";

import { findById, rate } from "../service/audit_store.js";

import FormErrorList from "../../components/FormErrorList.jsx";
import Modal from "../../components/Modal.jsx";

export default class AuditStoreQARatingForm extends Component{
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
				rating: auditStore && auditStore.qa_rating,
			});
		});
	}

	onSubmit = (e) => {
		e.preventDefault();
		let promise = rate(this.props.params.auditStoreId, this.state.rating);
		promise.then(()=>{
			this.props.router.goBack();
			Alert.success("RATING SAVED");
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
					<label className="control-label">Report Quality Rating:</label>
					<div className="btn-group btn-group-justified">
						<div className="btn-group">
							<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === 0 ? "active" : "")} onClick={() => this.ratingSelected(0)}>Bad</button>
						</div>
						<div className="btn-group">
							<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === 1 ? "active" : "")} onClick={() => this.ratingSelected(1)}>Average</button>
						</div>
						<div className="btn-group">
							<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === 2 ? "active" : "")} onClick={() => this.ratingSelected(2)}>Good</button>
						</div>
					</div>
				</div>
				<button className="btn btn-lg btn-primary">Save Rating</button>
			</form>
		</Modal>);
	}
}
