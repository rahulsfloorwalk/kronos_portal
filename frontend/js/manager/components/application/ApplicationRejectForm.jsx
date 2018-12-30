import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";

import Alert from "react-s-alert";

import { submitApplicationRejectForm } from "../../actions/application.js";
import { findById } from "../../service/application.js";

import { affectInputEventToComponent } from "../../../react_utils.js";
import FormErrorList from "../../../components/FormErrorList.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import Loading from "../../../components/Loading.jsx";

class ApplicationRejectForm extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			applicationId: PropTypes.string,
		}),
		router: PropTypes.shape({
			push: PropTypes.func,
			goBack: PropTypes.func,
		}),
	};

	static contextTypes = {
		auditCycleId: PropTypes.number
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

export default ReactRedux.connect()(ApplicationRejectForm);
