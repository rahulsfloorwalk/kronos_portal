import React, { Component } from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { rate } from "../service/audit_store.js";
import { updateAuditStore } from "../actions/audit_store";

import { } from "../../utils.js";
import { } from "../../react_utils.js";
import FormErrorList from "../../components/FormErrorList.jsx";
import { } from "../../components/FormInput.jsx";
import Modal from "../../components/Modal.jsx";
import Loading from "../../components/Loading.jsx";

import AuditorNameDisplay from "./AuditorNameDisplay.jsx";

export class AuditStoreQARatingForm extends Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		router: PropTypes.object.isRequired,
		params: PropTypes.shape({
			auditStoreId: PropTypes.oneOfType([
				PropTypes.string,
				PropTypes.number,
			]).isRequired,
		}),
		auditStore: PropTypes.object,
	};

	constructor(props){
		super(props);

		this.state = {
			rating: this.props.auditStore && this.props.auditStore.qa_rating,
			errors: {},
		};
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.auditStore){
			this.ratingSelected(nextProps.auditStore.qa_rating);
		}
	}

	onSubmit = (e) => {
		e.preventDefault();
		rate(this.props.params.auditStoreId, this.state.rating).then((auditStore)=>{
			this.props.dispatch(updateAuditStore(auditStore));
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
		const modalTitle = "Rate Report";
		if( ! this.props.auditStore){
			return (
				<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
					<Loading/>
				</Modal>
			);
		}
		return ( <Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
			<form onSubmit={this.onSubmit}>
				<FormErrorList errors={this.state.errors.non_field_errors}/>
				<div><label>Auditor:</label><AuditorNameDisplay user={this.props.auditStore.user}/></div>
				<p><label>Report Date:</label> { moment(this.props.auditStore.audit_date).format(momentDateFormat) }</p>
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
		</Modal>
		);
	}
}

let mapStoreToProps = function(store, ownProps){
	return {
		auditStore: store.auditStores[ownProps.params.auditStoreId],
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditStoreQARatingForm);
