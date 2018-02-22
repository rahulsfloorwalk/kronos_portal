import React, { Component } from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import Alert from 'react-s-alert';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { fetchAuditStore, acceptAuditStore } from '../actions/audit_store.js';

import { getAuditType, getAuditStatus } from '../../utils.js';
import { affectInputEventToComponent } from '../../react_utils.js';
import FormErrorList from '../../components/FormErrorList.jsx';
import { FormDateInput } from '../../components/FormInput.jsx';
import FormInput from '../../components/FormInput.jsx';
import FormSelect from '../../components/FormSelect.jsx';
import FormGroup from '../../components/FormGroup.jsx';
import FormTextarea from '../../components/FormTextarea.jsx';
import SaveButton from '../../components/SaveButton.jsx';
import Modal from '../../components/Modal.jsx';
import Loading from '../../components/Loading.jsx';

class AuditStoreAcceptForm extends Component{
	constructor(props){
		super(props);
		this.state = {
			payment_amount: 0,
			errors: {},
		};
	}
	componentDidMount(){
		this.props.dispatch(fetchAuditStore(this.props.params.auditStoreId));
		if(this.props.auditStore){
			this.setState({
				'payment_amount': this.props.auditStore.audit.earnings_per_audit + this.props.auditStore.audit.reimbursement,
			});
		}
	}
	componentWillReceiveProps(nextProps) {
		if(nextProps.auditStore){
			this.setState({
				'payment_amount': nextProps.auditStore.audit.earnings_per_audit + nextProps.auditStore.audit.reimbursement,
			});
		};
	}
	fieldChanged = (e) => {
		affectInputEventToComponent(e, this);
	}
	onSubmit = (e) => {
		e.preventDefault();
		let promise = this.props.dispatch(acceptAuditStore(this.props.params.auditStoreId, this.state.payment_amount));
		promise.then(()=>{
			this.props.router.push({
				pathname: `/audit_cycle/${this.props.auditStore.audit.audit_cycle.id}/audit_store`,
				state: {
					reload: true,
				},
			});
			Alert.success("REPORT ACCEPTED");
		}, (err)=>{
			this.setState({
				errors: err.responseJSON,
			});
		});
	}
	render(){
		if( ! this.props.auditStore){
			return (
				<Modal modalTitle="Accept Report" onClose={hashHistory.goBack}>
					<Loading/>
				</Modal>
			);
		}
		return ( <Modal modalTitle="Accept Report" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<p><label>Report Date:</label> { moment(this.props.auditStore.audit_date).format(momentDateFormat) }</p>
					<FormInput type="number" label="Total Payment" value={this.state.payment_amount} name="payment_amount" onChange={this.fieldChanged} errors={this.state.errors.payment_amount}/>
					<SaveButton text="Accept Report"/>
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

export default ReactRedux.connect( mapStoreToProps)(AuditStoreAcceptForm);
