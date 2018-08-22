import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { hashHistory } from "react-router";

import { fetchClientUsers, updateClientUserStoreVisibility } from "../actions/client_user.js";
import { fetchStore } from "../actions/store.js";
import { fetchClientUsersForStore, assignStoreToClientUser, revokeStoreFromClientUser } from "../service/client_user.js";

import { Checked, Unchecked, OptionHorizontal } from "../../components/Icons.jsx";
import Modal from "../../components/Modal.jsx";

class StoreAssignForm extends React.Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			storeId: PropTypes.string.isRequired,
			clientId: PropTypes.string.isRequired,
		}),
		store: PropTypes.object,
		clientUserStoreVisibility: PropTypes.array.isRequired,
		clientUsers: PropTypes.object.isRequired,
	};

	constructor(props){
		super(props);
		this.state = {
			loading: {},
		};
	}

	setLoading = (userId, loading) => {
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				loading: Object.assign({}, prevState.loading, {
					[userId]: loading
				})
			});
		});
	};

	componentDidMount() {
		fetchClientUsersForStore(this.props.params.storeId).then(clientUsers => {
			this.props.dispatch(updateClientUserStoreVisibility(this.props.params.storeId, clientUsers));
		});
		this.props.dispatch(fetchStore(this.props.params.storeId));
		this.props.dispatch(fetchClientUsers(this.props.params.clientId));
	}

	assignStore = (clientUser) => {
		this.setLoading(clientUser.user.id, true);
		assignStoreToClientUser(this.props.store.id, clientUser.user.id).then((clientUsers) => {
			this.props.dispatch(updateClientUserStoreVisibility(this.props.params.storeId, clientUsers));
		}).always(() => this.setLoading(clientUser.user.id, false));
	};

	revokeStore = (clientUser) => {
		this.setLoading(clientUser.user.id, true);
		revokeStoreFromClientUser(this.props.store.id, clientUser.user.id).then((clientUsers) => {
			this.props.dispatch(updateClientUserStoreVisibility(this.props.params.storeId, clientUsers));
		}).always(() => this.setLoading(clientUser.user.id, false));
	};

	render(){
		let rows = [];
		for( let id in this.props.clientUsers){
			let cu = this.props.clientUsers[id];
			let button;
			if(this.props.clientUserStoreVisibility.indexOf(cu.user.id) > -1){
				button = <button onClick={() => this.revokeStore(cu)} className="btn btn-primary" disabled={this.state.loading[cu.user.id]}>
					{this.state.loading[cu.user.id] ?
						<OptionHorizontal/>
						:
						<Checked/>
					}
				</button>;
			} else {
				button = <button onClick={() => this.assignStore(cu)} className="btn btn-default" disabled={this.state.loading[cu.user.id]}>
					{this.state.loading[cu.user.id] ?
						<OptionHorizontal/>
						:
						<Unchecked/>
					}
				</button>;
			}
			rows.push(<tr key={cu.id}>
				<td>{button}</td>
				<td>{cu.full_name}</td>
			</tr>);
		}
		return (
			<Modal modalTitle={"Assign Users to " + this.props.store.name} onClose={hashHistory.goBack}>
				<table className="table table-striped">
					<thead>
						<th>Assign/Revoke</th>
						<th>Client User</th>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			</Modal>
		);
	}
}

let mapStoreToProps = function(store, ownProps){
	return {
		store: store.stores[ownProps.params.storeId] || {},
		clientUserStoreVisibility: store.clientUserStoreVisibility[ownProps.params.storeId] || [],
		clientUsers: store.clientUsers,
	};
};

export default connect( mapStoreToProps)(StoreAssignForm);
