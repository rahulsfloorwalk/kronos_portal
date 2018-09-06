import React from "react";
import PropTypes from "prop-types";

import Alert from "react-s-alert";

import { findById, setReimbursement } from "../service/audit_store.js";

import ReimbursementForm from "../../components/audit_store/ReimbursementForm.jsx";

export default class AuditStoreReimbursementForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditStoreId: PropTypes.string.isRequired,
		}).isRequired,
		router: PropTypes.shape({
			push: PropTypes.func.isRequired,
			goBack: PropTypes.func.isRequired,
		}).isRequired,

	};

	state = {
		errors: {},
		loading: true,
		auditStore: {},
	};

	setLoading = (loading) => this.setState((prevState) => Object.assign({}, prevState, { loading }));

	componentDidMount(){
		this.setLoading(true);
		findById(this.props.params.auditStoreId).then(auditStore => {
			this.setState({ auditStore });
		}).always(() => this.setLoading(false));
	}

	onSubmit = (reimbursement) => {
		const promise = setReimbursement(this.props.params.auditStoreId, reimbursement);
		promise.then(()=>{
			this.props.router.goBack();
			Alert.success("REIMBURSEMENT CHANGED");
		}, (err)=>{
			this.setState({
				errors: err.responseJSON,
			});
		});
	};

	render(){
		return <ReimbursementForm
			reimbursement={this.state.auditStore.reimbursement}
			errors={this.state.errors}
			onSubmit={this.onSubmit}
			loading={this.state.loading}
			onClose={this.props.router.goBack}
		/>;
	}
}

