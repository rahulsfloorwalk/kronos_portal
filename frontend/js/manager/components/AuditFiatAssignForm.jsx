import React from 'react';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { fiatAssignAudit } from '../service/application.js';

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

class AuditFiatAssignForm extends React.Component {
    state = {
        errors: {}
    };

    componentDidMount() {
		if(this.props.audit){
			this.setState({
				'audit': this.props.params.auditId
			});
		}
	}

    dateChanged = (date) => {
		if( typeof date !== "string"){
			this.setState({
				audit_date: date.format("YYYY-MM-DD")
			});
		}
	};

    inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

    onSubmit = (e) => {
		e.preventDefault();
		var promise = fiatAssignAudit(this.props.params.auditId, this.state.email, this.state.audit_date);
		promise.done(() => hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/audit`));
		promise.fail((error) => this.setState({errors: error.responseJSON || {}}));
	};

    render() {
		if( ! this.props.audit){
			return <Loading/>;
		}
		return (
			<Modal modalTitle="Approve Application" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<p>Store: <b>{this.props.audit.store.name}, {this.props.audit.store.city.name}</b></p>
					<p>Audit Cycle Dates: <b>{moment(this.props.auditCycle.start_date).format(momentDateFormat)}</b> to <b>{moment(this.props.auditCycle.end_date).format(momentDateFormat)}</b></p>
					<FormInput label="User Email" value={this.state.email} name="email" onChange={this.inputChanged} errors={this.state.errors.email}/>
					<FormDateInput label="Audit Date" value={this.state.audit_date} name="audit_date" onChange={this.dateChanged} errors={this.state.errors.audit_date}/>
					<SaveButton text="Approve"/>
				</form>
			</Modal>
		);
	}
}

var mapStoreToProps = function(store, ownProps){
  console.log(ownProps);
	return {
		auditCycle: store.auditCycles[ownProps.params.auditCycleId],
		audit: store.audits[ownProps.params.auditId],
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditFiatAssignForm);
