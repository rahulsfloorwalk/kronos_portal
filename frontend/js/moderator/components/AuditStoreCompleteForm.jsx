import React, { Component } from 'react';
import $ from 'jquery';
import { hashHistory } from 'react-router';

import Alert from 'react-s-alert';

import { complete } from '../service/audit_store.js';

import FormErrorList from '../../components/FormErrorList.jsx';
import Modal from '../../components/Modal.jsx';

export default class AuditStoreCompleteForm extends Component{
	constructor(props){
		super(props);
		this.state = {
			errors: {},
		};
	}
	onSubmit = (e) => {
		e.preventDefault();
		let promise = complete(this.props.params.auditStoreId, this.state.rating);
		promise.then(()=>{
			hashHistory.goBack();
			Alert.success("REPORT COMPLETED");
		}, (err)=>{
			this.setState({
				errors: err.responseJSON,
			});
		});
	}
	ratingSelected = (rating) => {
		this.setState({rating});
	}
	render(){
		return ( <Modal modalTitle="Complete Report" onClose={hashHistory.goBack}>
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
					<button className="btn btn-lg btn-success">Complete Report</button>
				</form>
			</Modal>
		);
	}
}
