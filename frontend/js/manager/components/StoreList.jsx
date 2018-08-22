import React from "react";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";

import { Cross, Plus, Home, Pencil, HandRight } from "../../components/Icons.jsx";
import { fetchStores, deleteStore } from "../actions/store.js";

class StoreRow extends React.Component {
	render() {
		let linkTo = `/client/${this.props.store.client_id}/store/${this.props.store.id}/edit`;
		let assignLink = `/client/${this.props.store.client_id}/store/${this.props.store.id}/assign`;
		return (
			<tr>
				<td className="text-right">{this.props.serial}</td>
				<td>{this.props.store.code}</td>
				<td>{this.props.store.name} {this.props.store.priority ? "("+this.props.store.priority+")" : null}</td>
				<td>{this.props.store.type}</td>
				<td>{this.props.store.phone}</td>
				<td>{this.props.store.address}</td>
				<td>
					{this.props.store.city.name}, <br/>
					{this.props.store.city.state}</td>
				<td>
					<Link to={assignLink} className="btn btn-default"><HandRight/></Link>
					<Link to={linkTo} className="btn btn-default"><Pencil/></Link>
					<button type="button" onClick={this.props.onDelete ? () => this.props.onDelete(this.props.store): ()=>{}} className="btn btn-default"><Cross/></button>
				</td>
			</tr>
		);
	}
}

class StoreList extends React.Component {
	componentDidMount() {
		this.props.dispatch(fetchStores(this.props.params.clientId));
	}

    onDelete = (store) => {
    	console.log("StoreList#onDelete", store);
    	this.props.dispatch(deleteStore(store.id));
    };

    render() {
    	var rows = [];
    	let serial = 1;
    	for(var id in this.props.stores) {
    		rows.push(<StoreRow serial={serial++} store={this.props.stores[id]} key={id} onDelete={this.onDelete}/>);
    	}
    	var addStoreLink = `/client/${this.props.params.clientId}/store/add`;
    	return (
    		<div>
    			<h3 className="page-header">
    				<Link to={addStoreLink} className="btn btn-default pull-right"><Plus/> Add Store</Link>
    				<Home/> Store List
    			</h3>
    			<table className="table table-striped">
    				<colgroup>
    					<col style={{width: "5%"}}/>
    					<col style={{width: "20%"}}/>
    					<col style={{width: "50%"}}/>
    					<col style={{width: "20%"}}/>
    					<col style={{width: "5%"}}/>
    				</colgroup>
    				<thead>
    					<tr>
    						<th className="text-right">#</th>
    						<th>Code</th>
    						<th>Name</th>
    						<th>Type</th>
    						<th>Phone</th>
    						<th>Address</th>
    						<th>City</th>
    						<th></th>
    					</tr>
    				</thead>
    				<tbody>
    					{rows}
    				</tbody>
    			</table>
    			{this.props.children}
    		</div>
    	);
    }
}

var mapStoreToProps = function(store, ownProps){
	return {
		stores: store.stores,

	};
};

export default ReactRedux.connect(mapStoreToProps)(StoreList);
