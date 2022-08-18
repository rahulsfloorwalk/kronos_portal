import React, { Component } from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";


import { auditor_rate } from "../../service/audit_store.js";
import { updateAuditStore } from "../../actions/audit_store";

import { } from "../../../utils.js";
import { } from "../../../react_utils.js";
import FormErrorList from "../../../components/FormErrorList.jsx";
import { } from "../../../components/FormInput.jsx";
import Modal from "../../../components/Modal.jsx";
import Loading from "../../../components/Loading.jsx";

import AuditorNameDisplay from "../AuditorNameDisplay.jsx";

export class AuditStoreAuditorRatingForm extends Component{
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
			rating: this.props.auditStore && this.props.auditStore.user.profileinfo.avg_auditor_rating,
			errors: {},
		};
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.auditStore){
			this.ratingSelected(nextProps.auditStore.user.profileinfo.avg_auditor_rating);
		}
	}

	onSubmit = (e) => {
		e.preventDefault();
		auditor_rate(this.props.params.auditStoreId, this.state.rating).then((auditStore)=>{
			this.props.dispatch(updateAuditStore(auditStore));
			this.props.router.goBack();
			Alert.success("AUDITOR RATING SAVED");
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
		const modalTitle = "Rate Auditor";
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
				<br/>
				<div className="form-group">
					<label className="control-label">Auditor Rating:</label>
					<div className="btn-group btn-group-justified">
						<div className="btn-group">
							<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === 1 ? "active" : "")} onClick={() => this.ratingSelected(1)}>Worse</button>
						</div>
						<div className="btn-group">
							<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === 2 ? "active" : "")} onClick={() => this.ratingSelected(2)}>Average</button>
						</div>
						<div className="btn-group">
							<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === 3 ? "active" : "")} onClick={() => this.ratingSelected(3)}>Good</button>
						</div>
						<div className="btn-group">
							<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === 4 ? "active" : "")} onClick={() => this.ratingSelected(4)}>Excellent</button>
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

export default ReactRedux.connect( mapStoreToProps)(AuditStoreAuditorRatingForm);
