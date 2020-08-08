import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import * as ReactRedux from "react-redux";

import Modal from "../../components/Modal.jsx";

import {submitConcern, fetchAuditStore} from "../actions/audit_store.js";

import { auditStorePropType } from "../prop_types";

class ReportConcern extends React.Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditStoreId: PropTypes.string.isRequired,
		}),
		auditStore: auditStorePropType,
	};

	constructor(props){
		super(props);
		this.state = {
			message : "",
			error_message : "",
			success_message : null
		};
	}

	componentDidMount() {
		this.props.dispatch(fetchAuditStore(this.props.params.auditStoreId));
		if(this.props.auditStore.status === "FAILED" || this.props.auditStore.status === "SUBMITTED" || this.props.auditStore.status === "PM_REVIEW" || this.props.auditStore.status === "WITHDRAWN" || this.props.auditStore.status === "AUDITOR_WITHDRAWN" || this.props.auditStore.status === "COMPLETED" || this.props.auditStore.status === "ACCEPTED" || this.props.auditStore.status === "REJECTED"){
			hashHistory.push("audit_store");
		}
	}

	concernChanged = (e) => {
		this.setState({
			message : e.target.value,
			error_message : "",
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		if(this.state.message === ""){
			this.setState({
				error_message : "Please enter your concern"
			});
		}
		else{
			this.props.dispatch(submitConcern(this.props.params.auditStoreId, this.state.message)).then(()=>{
				this.setState({
					message: "",
					success_message : "Thank you for your concern, We will get back to you soon."
				});
				setTimeout(this.closeModal, 2000);
			});
		}
	};

	closeModal = () => {
		hashHistory.goBack();
	};

	render(){
		return (
			<Modal modalTitle="Concern About the Audit?" onClose={this.closeModal}>
				{
					this.state.success_message ?
						<div className="form-group">
							<span style={{color:"green", fontSize: "18px"}}><b>{this.state.success_message}</b></span>
							<br/>
							<br/>
							<button type="button" onClick={this.closeModal} className="btn btn-default">Close</button>
						</div>
						:
						<form onSubmit={this.onSubmit}>
							<p>If you have any <b>Concern</b> about this audit, you can write here.</p>
							<textarea rows="5" className="form-control" value={this.state.message} maxLength="4096" onChange={this.concernChanged}/>
							<span style={{color:"red"}}><b>{this.state.error_message}</b></span>
							<br/>
							<div className="form-group">
								<button type="submit" className="btn btn-primary">Submit</button>
								&nbsp;&nbsp;
								<button type="button" onClick={this.closeModal} className="btn btn-default">Close</button>
							</div>
						</form>
				}
			</Modal>
		);
	}
}

const mapStoreToProps = (store, ownProps) => {
	return {
		auditStore: store.auditStores[ownProps.params.auditStoreId],
	};
};
export default ReactRedux.connect( mapStoreToProps)(ReportConcern);