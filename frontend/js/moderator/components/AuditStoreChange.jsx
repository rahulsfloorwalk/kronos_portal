import React from "react";
import PropTypes from "prop-types";

import Alert from "react-s-alert";

import { findById, findStoreByClientId,setStoreStatus } from "../service/audit_store.js";
import StoreChangeForm from "./StoreChangeForm.jsx";

export default class AuditStoreChange extends React.Component {
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
		stores: [],
	};

	setLoading = (loading) => this.setState((prevState) => Object.assign({}, prevState, { loading }));

	componentDidMount(){
		this.setLoading(true);
		findById(this.props.params.auditStoreId)
			.then((auditStore) => {
				this.setState({ auditStore });
				if (auditStore && auditStore.audit.audit_cycle.client.id) {
					return findStoreByClientId(auditStore.audit.audit_cycle.client.id);
				}
			})
			.then((stores) => {
				if (stores) {
					this.setState({stores});
				}
			}).always(() => this.setLoading(false));
	}

	onSubmit = (storeId) => {
		const promise = setStoreStatus(+storeId,this.props.params.auditStoreId,this.state.auditStore.audit.audit_cycle.id);
		promise.then(()=>{
			this.props.router.goBack();
			Alert.success("Store Changed Successfully");
		}, (err)=>{
			this.setState({
				errors: err.responseJSON,
			});
		});
	};

	render(){
		let selectedStoreId;
		if(this.state.auditStore.audit){
			selectedStoreId = this.state.auditStore.audit.store.id;
		}
		return <StoreChangeForm
			stores={this.state.stores}
			errors={this.state.errors}
			onSubmit={this.onSubmit}
			loading={this.state.loading}
			selectedStoreId={selectedStoreId}
			onClose={this.props.router.goBack}
		/>;
	}
}