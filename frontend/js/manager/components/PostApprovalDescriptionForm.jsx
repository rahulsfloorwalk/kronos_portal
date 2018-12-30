import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import { fetchAuditCycle, setPostApprovalDescription } from "../actions/audit.js";

import { affectInputEventToComponent } from "../../react_utils.js";
import FormTextarea from "../../components/FormTextarea.jsx";
import SaveButton from "../../components/SaveButton.jsx";
import Modal from "../../components/Modal.jsx";
import MarkdownViewer from "../../components/MarkdownViewer.jsx";

class PostApprovalDescriptionForm extends React.Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}),
		auditCycle: PropTypes.shape({
			post_approval_description: PropTypes.string,
		}),
		errors: PropTypes.shape({
			post_approval_description: PropTypes.string,
		}),
	};

	constructor(props){
		super(props);
		this.state = {
			post_approval_description: null
		};
	}

	componentDidMount() {
		this.props.dispatch(fetchAuditCycle(this.props.params.auditCycleId));

		if(this.props.auditCycle){
			this.setState({
				post_approval_description: this.props.auditCycle.post_approval_description
			});
		}
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.auditCycle){
			this.setState({
				post_approval_description: nextProps.auditCycle.post_approval_description
			});
		}
	}

	fieldChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.props.dispatch(setPostApprovalDescription(this.props.params.auditCycleId, this.state.post_approval_description)).then((savedAuditCycle) => {
			hashHistory.push(`/audit_cycle/${savedAuditCycle.id}/questionnaire`);
		});
	};

	render(){
		return (
			<Modal modalTitle={"Post Approval Description"} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormTextarea label="Post Approval Description (markdown)" name="post_approval_description" value={this.state.post_approval_description} onChange={this.fieldChanged} errors={this.props.errors.post_approval_description}/>
					<div>
						<label>Preview:</label>
						<MarkdownViewer markdown={this.state.post_approval_description}/>
					</div>
					<SaveButton/>
				</form>
			</Modal>
		);
	}
}

var mapStoreToProps = function(store, ownProps){
	return {
		auditCycle: store.auditCycles[ownProps.params.auditCycleId] || {},
		errors: store.forms.auditCycle.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(PostApprovalDescriptionForm);
