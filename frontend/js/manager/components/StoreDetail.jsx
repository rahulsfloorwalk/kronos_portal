import React from "react";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";

import { fetchStore } from "../actions/store.js";

import { Pencil, Home, King } from "../../components/Icons.jsx";
import Panel from "../../components/Panel.jsx";
import Loading from "../../components/Loading.jsx";

class StoreDetail extends React.Component {
	componentDidMount() {
		this.props.dispatch(fetchStore(this.props.params.storeId));
	}

	render() {
		if(! this.props.store){
			return <Loading/>;
		}
		var editLink = `/store/${this.props.params.storeId}/edit`;
		return (
			<div>
				<ol className="breadcrumb">
					<li><Link to="/client">Clients</Link></li>
					<li><Link to={`/client/${this.props.store.client.id}/store`}><King/> {this.props.store.client.name}</Link></li>
					<li className="active"><Home/> {this.props.store.name}</li>
				</ol>
				<h2 className="page-header">
					{ this.props.store.name }
				</h2>
				<div className="row">
					<div className="col-md-6">
						<div className="panel panel-primary">
							<div className="panel-heading">
								<Link to={editLink} className="btn btn-default btn-sm pull-right"><Pencil/></Link>
								<h4><Home/> Store Info</h4>
							</div>
							<table className="table table-striped">
								<tbody>
									<tr><td className="text-right">Name</td><td><b>{ this.props.store.name }</b></td></tr>
									<tr><td className="text-right">Address</td><td><b>{ this.props.store.address }</b></td></tr>
									<tr><td className="text-right">City</td><td><b>{ this.props.store.city.name }</b></td></tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
				{this.props.children}
			</div>
		);
	}
}

var mapStoreToProps = function(store, ownProps){
	return {
		store: store.stores[ownProps.params.storeId]
	};
};

export default ReactRedux.connect(mapStoreToProps)(StoreDetail);
