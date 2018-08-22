import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';

import Alert from 'react-s-alert';

import { submitApplicationRejectForm } from '../actions/application.js';
import { findById } from '../service/application.js';

import { getAuditType, getAuditStatus } from '../../utils.js';
import { affectInputEventToComponent } from '../../react_utils.js';
import FormErrorList from '../../components/FormErrorList.jsx';
import FormInput from '../../components/FormInput.jsx';
import FormSelect from '../../components/FormSelect.jsx';
import FormGroup from '../../components/FormGroup.jsx';
import FormTextarea from '../../components/FormTextarea.jsx';
import SaveButton from '../../components/SaveButton.jsx';
import Modal from '../../components/Modal.jsx';
import Loading from '../../components/Loading.jsx';

class ApplicationRejectForm extends React.Component {
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
			});
		});
	}

    fieldChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

    onSubmit = (e) => {
		e.preventDefault();
		var promise = this.props.dispatch(submitApplicationRejectForm(this.props.params.applicationId));
		promise.then(() => {
			this.props.router.push({
				pathname: `/audit_cycle/${this.context.auditCycleId}/audit`,
				state: { t: Date.now() },
			});
			Alert.success("APPLICATION DENIED");
		});
	};

    render() {
		if( ! this.state.application){
			return <Loading/>;
		}
		return (
			<Modal modalTitle="Deny Application" onClose={this.props.router.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<p><label>Auditor Name:</label> { this.state.application.profileinfo.first_name } {this.state.application.profileinfo.last_name}</p>
					<p>Are you sure you want to reject this application?</p>
					<SaveButton text="Deny"/>
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

export default ReactRedux.connect()(ApplicationRejectForm);
