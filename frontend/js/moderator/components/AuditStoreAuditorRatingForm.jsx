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
				rating: auditStore && auditStore.user.profileinfo.avg_auditor_rating,
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
					<div className="star-rating star-rating-lg">
						<input type="radio" id="5-stars" name="rating" onChange={() => this.ratingSelected(5)} checked={this.state.rating === 5}/>
						<label htmlFor="5-stars" className="star">&#9733;</label>
						<input type="radio" id="4-stars" name="rating" onChange={() => this.ratingSelected(4)} checked={this.state.rating === 4}/>
						<label htmlFor="4-stars" className="star">&#9733;</label>
						<input type="radio" id="3-stars" name="rating" onChange={() => this.ratingSelected(3)} checked={this.state.rating === 3}/>
						<label htmlFor="3-stars" className="star">&#9733;</label>
						<input type="radio" id="2-stars" name="rating" onChange={() => this.ratingSelected(2)} checked={this.state.rating === 2}/>
						<label htmlFor="2-stars" className="star">&#9733;</label>
						<input type="radio" id="1-star" name="rating" onChange={() => this.ratingSelected(1)} checked={this.state.rating === 1}/>
						<label htmlFor="1-star" className="star">&#9733;</label>
					</div>
				</div>
				<button className="btn btn-lg btn-primary">Save Rating</button>
			</form>
		</Modal>);
	}
}
