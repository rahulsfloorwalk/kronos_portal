import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import Alert from "react-s-alert";

import moment from "moment";
import { momentDateFormat }  from "../../../../config.js";

import { fetchAuditStore, updateAuditStore } from "../../actions/audit_store.js";
import { failReport } from "../../service/audit_store.js";

import { affectInputEventToComponent } from "../../../react_utils.js";
import FormErrorList from "../../../components/FormErrorList.jsx";
import FormInput from "../../../components/FormInput.jsx";
import Modal from "../../../components/Modal.jsx";
import Loading from "../../../components/Loading.jsx";
import { auditStorePropType } from "../../prop_types";

export class FailReportMessageForm extends Component{
	static propTypes = {
		params: PropTypes.shape({
			auditStoreId: PropTypes.string.isRequired,
		}).isRequired,
		router: PropTypes.shape({
			push: PropTypes.func.isRequired,
			goBack: PropTypes.func.isRequired,
		}).isRequired,

		auditStore: auditStorePropType,

		loadAuditStore: PropTypes.func.isRequired,
		onSubmit: PropTypes.func.isRequired,
	};

	state = {
		reimbursement: 0,
		errors: {},
	};

	componentDidMount(){
		this.props.loadAuditStore(this.props.params.auditStoreId);
		if(this.props.auditStore){
			this.setState({
				message: "Failed due to non compliance of audit guidelines"
			});
		}
	}

	fieldChanged = (e) => {
		affectInputEventToComponent(e, this);
	};
	onSubmit = (e) => {
		e.preventDefault();
		let promise = this.props.onSubmit(this.props.params.auditStoreId, this.state.message);
		promise.then(()=>{
			this.props.router.push(`/audit_store/${this.props.params.auditStoreId}/report`);
			Alert.error("REPORT FAILED");
		}, (err)=>{
			this.setState({
				errors: err.responseJSON,
			});
		});
	};
	render(){
		const modalTitle = "Set Failure Message";
		if( ! this.props.auditStore){
			return (
				<Modal modalTitle={modalTitle} onClose={this.props.router.goBack}>
					<Loading/>
				</Modal>
			);
		}
		const auditorName = this.props.auditStore.user.profileinfo ? this.props.auditStore.user.profileinfo.first_name + " " + this.props.auditStore.user.profileinfo.last_name : this.props.auditStore.user.agencyuser.full_name;
		return (
			<Modal modalTitle={modalTitle} onClose={this.props.router.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<p><label>Assigned To:</label> { auditorName }</p>
					<p><label>Report Date:</label> { moment(this.props.auditStore.audit_date).format(momentDateFormat) }</p>
					<FormInput type="text" label="Message" value={this.state.message} name="message" onChange={this.fieldChanged} errors={this.state.errors.message}/>
					<button type="submit" className="btn btn-danger">Fail Report</button>
				</form>
			</Modal>
		);
	}
}

const mapStoreToProps = (store, ownProps) => {
	return {
		auditStore: store.auditStores[ownProps.params.auditStoreId],
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		loadAuditStore: (auditStoreId) => {
			dispatch(fetchAuditStore(auditStoreId));
		},
		onSubmit: (auditStoreId, message) => {
			const promise = failReport(auditStoreId, message);
			promise.then((auditStore) => {
				dispatch(updateAuditStore(auditStore));
			});
			return promise;
		},
	};
};

export default connect( mapStoreToProps, mapDispatchToProps)(FailReportMessageForm);
