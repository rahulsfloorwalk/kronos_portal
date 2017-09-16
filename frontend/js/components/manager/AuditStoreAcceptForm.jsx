import React, { Component } from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { acceptAuditStore } from '../../manager/actions/audit_store.js';

import { getAuditType, getAuditStatus } from '../../utils.js';
import { affectInputEventToComponent } from '../../react_utils.js';
import FormErrorList from '../FormErrorList.jsx';
import { FormDateInput } from '../FormInput.jsx';
import FormInput from '../FormInput.jsx';
import FormSelect from '../FormSelect.jsx';
import FormGroup from '../FormGroup.jsx';
import FormTextarea from '../FormTextarea.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';
import Loading from '../Loading.jsx';

class AuditStoreAcceptForm extends Component{
	constructor(props){
		super(props);
		this.state = {
			payment_amount: 0,
			errors: {},
		};
	}
	componentDidMount(){
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
		promise.then(hashHistory.goBack, (err)=>{
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
