import React, { Component } from 'react';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import Alert from 'react-s-alert';

import { fetchClientUsers } from '../actions/client_user.js';
import { fetchStore, updateStore } from '../actions/store.js';
import { assignStoreToClientUser, revokeStoreFromClientUser } from '../service/store.js';

import { Checked, Unchecked } from '../../components/Icons.jsx';
import Modal from '../../components/Modal.jsx';

let StoreAssignForm = React.createClass({

	componentDidMount: function() {
		this.props.dispatch(fetchStore(this.props.params.storeId));
		this.props.dispatch(fetchClientUsers(this.props.params.clientId));
	},

	assignStore: function(clientUser) {
		assignStoreToClientUser(this.props.store.id, clientUser.user.id).then((store) => this.props.dispatch(updateStore(store)));
	},

	revokeStore: function(clientUser) {
		revokeStoreFromClientUser(this.props.store.id, clientUser.user.id).then((store) => this.props.dispatch(updateStore(store)));
	},

	render: function(){
		console.log("stores perms:", this.props.store.visible_to);
		let rows = [];
		for( let id in this.props.clientUsers){
			let cu = this.props.clientUsers[id];
			let button;
			if(this.props.store.visible_to.indexOf(cu.user.id) > -1){
				button = <button onClick={() => this.revokeStore(cu)} className="btn btn-primary"><Checked/></button>;
			} else {
				button = <button onClick={() => this.assignStore(cu)} className="btn btn-default"><Unchecked/></button>;
			}
			rows.push(<tr key={cu.id}>
				<td>{button}</td>
				<td>{cu.full_name}</td>
			</tr>);
		}
		return (
			<Modal modalTitle="Assign Store" onClose={hashHistory.goBack}>
				<table className="table table-striped">
					<thead>
						<th>Assign/Revoke</th>
						<th>User</th>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			</Modal>
		);
	}
});

let mapStoreToProps = function(store, ownProps){
	return {
		store: store.stores[ownProps.params.storeId] || {},
		clientUsers: store.clientUsers,
	};
};

export default ReactRedux.connect( mapStoreToProps)(StoreAssignForm);
