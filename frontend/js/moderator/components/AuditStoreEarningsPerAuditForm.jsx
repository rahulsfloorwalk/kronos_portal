import React from "react";
import PropTypes from "prop-types";

import Alert from "react-s-alert";

import { findById, setEarningsPerAudit } from "../service/audit_store.js";

import EarningsPerAuditForm from "../../components/audit_store/EarningsPerAuditForm.jsx";

export default class AuditStoreEarningsPerAuditForm extends React.Component {
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

	onSubmit = (earningsPerAudit) => {
		const promise = setEarningsPerAudit(this.props.params.auditStoreId, earningsPerAudit);
		promise.then(()=>{
			this.props.router.goBack();
			Alert.success("AUDIT FEES CHANGED");
		}, (err)=>{
			this.setState({
				errors: err.responseJSON,
			});
		});
	};

	render(){
		return <EarningsPerAuditForm
			earningsPerAudit={this.state.auditStore.earnings_per_audit}
			errors={this.state.errors}
			onSubmit={this.onSubmit}
			loading={this.state.loading}
			onClose={this.props.router.goBack}
		/>;
	}
}

