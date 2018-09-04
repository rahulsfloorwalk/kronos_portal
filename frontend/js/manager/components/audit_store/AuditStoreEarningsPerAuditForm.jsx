import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import Alert from "react-s-alert";

import moment from "moment";
import { momentDateFormat }  from "../../../../config.js";

import { fetchAuditStore, updateAuditStore } from "../../actions/audit_store.js";
import { setEarningsPerAudit } from "../../service/audit_store.js";

import { affectInputEventToComponent } from "../../../react_utils.js";
import FormErrorList from "../../../components/FormErrorList.jsx";
import FormInput from "../../../components/FormInput.jsx";
import Modal from "../../../components/Modal.jsx";
import Loading from "../../../components/Loading.jsx";
import { auditStorePropType } from "../../prop_types";

export class AuditStoreEarningsPerAuditForm extends Component{
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
		earnings_per_audit: 0,
		errors: {},
	};

	componentDidMount(){
		this.props.loadAuditStore(this.props.params.auditStoreId);
		if(this.props.auditStore){
			this.setState({
				"earnings_per_audit": this.props.auditStore.earnings_per_audit || this.props.auditStore.audit.earnings_per_audit,
			});
		}
	}
	componentWillReceiveProps(nextProps) {
		if(nextProps.auditStore){
			this.setState({
				"earnings_per_audit": nextProps.auditStore.earnings_per_audit || nextProps.auditStore.audit.earnings_per_audit,
			});
		}
	}
	fieldChanged = (e) => {
		affectInputEventToComponent(e, this);
	};
	onSubmit = (e) => {
		e.preventDefault();
		let promise = this.props.onSubmit(this.props.params.auditStoreId, this.state.earnings_per_audit);
		promise.then(()=>{
			this.props.router.push(`/audit_store/${this.props.params.auditStoreId}/report`);
			Alert.success("EARNINGS PER AUDIT SAVED");
		}, (err)=>{
			this.setState({
				errors: err.responseJSON,
			});
		});
	};
	render(){
		const modalTitle = "Set Earnings per Audit";
		if( ! this.props.auditStore){
			return (
				<Modal modalTitle={modalTitle} onClose={this.props.router.goBack}>
					<Loading/>
				</Modal>
			);
		}
		return ( <Modal modalTitle={modalTitle} onClose={this.props.router.goBack}>
			<form onSubmit={this.onSubmit}>
				<FormErrorList errors={this.state.errors.non_field_errors}/>
				<p><label>Report Date:</label> { moment(this.props.auditStore.audit_date).format(momentDateFormat) }</p>
				<FormInput type="number" label="Earnings per Audit" value={this.state.earnings_per_audit} name="earnings_per_audit" onChange={this.fieldChanged} errors={this.state.errors.earnings_per_audit}/>
				<button type="submit" className="btn btn-primary">Save Amount</button>
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
		onSubmit: (auditStoreId, earningsPerAudit) => {
			const promise = setEarningsPerAudit(auditStoreId, earningsPerAudit);
			promise.then((auditStore) => {
				dispatch(updateAuditStore(auditStore));
			});
			return promise;
		},
	};
};

export default connect( mapStoreToProps, mapDispatchToProps)(AuditStoreEarningsPerAuditForm);
