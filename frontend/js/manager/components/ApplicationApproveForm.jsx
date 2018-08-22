import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';

import Alert from 'react-s-alert';

import { submitApplicationApproveForm } from '../actions/application.js';
import { findById } from '../service/application.js';

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

class ApplicationApproveForm extends React.Component {
    static contextTypes = {
		auditCycleId: React.PropTypes.number
	};

    state = {
        application: null,
        errors: {},
    };

    componentDidMount() {
		findById(this.props.params.applicationId).then(application => {
			this.setState({
				application,
				'audit_date': application.audit_date
			});
		});
	}

    /*
	componentWillReceiveProps: function(nextProps) {
		console.log("nextProps.application",nextProps.application);
		if(nextProps.application && ! this.state.date_set ){
			this.setState({
				'audit_date': nextProps.application.audit_date,
				'date_set': true
			});
		};
	},
	*/
    dateChanged = (date) => {
		if( typeof date !== "string"){
			this.setState({
				audit_date: date.format("YYYY-MM-DD")
			});
		}
	};

    onSubmit = (e) => {
		e.preventDefault();
		var obj = {
			application_id: this.state.application.id,
			audit_date: this.state.audit_date
		};
		var promise = this.props.dispatch(submitApplicationApproveForm(obj));
		promise.then(() => {
			this.props.router.push({
				pathname: `/audit_cycle/${this.context.auditCycleId}/audit`,
				state: { t: Date.now() },
			});
			Alert.success("APPLICATION APPROVED");
		}, (err) => {
			this.setState({ errors: err && err.responseJSON });
		});
	};

    render() {
		if( ! this.state.application){
			return <Loading/>;
		}
		return (
			<Modal modalTitle="Approve Application" onClose={this.props.router.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<p><label>Auditor Name:</label> { this.state.application.profileinfo.first_name } {this.state.application.profileinfo.last_name}</p>
					<FormDateInput label="Approved Audit Date" value={this.state.audit_date} name="audit_date" onChange={this.dateChanged} errors={this.state.errors.audit_date}/>
					<SaveButton text="Approve"/>
				</form>
			</Modal>
		);
	}
}

var mapStoreToProps = function(store, ownProps){
	var application;
	try{
		application = store.audits[ownProps.params.auditId].applications.filter(function(app){
			return app.id === Number(ownProps.params.applicationId);
		})[0];
	}catch(e){
		console.log("looks like we're still loading the application...",e);
	}
	return {
		application,
		errors: store.errors,
	};
};

export default ReactRedux.connect()(ApplicationApproveForm);
