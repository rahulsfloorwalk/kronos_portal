import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";

import { fetchStores } from "../../../actions/store.js";

import { storePropType } from "../../../prop_types";
import Loading from "../../../../components/Loading.jsx";
import Jumbotron from "../../../../components/Jumbotron.jsx";

class StoreRow extends React.Component {
	static propTypes = {
		store: storePropType,
		serial: PropTypes.number,
	};

	render() {
		return (
			<tr>
				<td className="text-right">{this.props.serial}</td>
				<td>{this.props.store.code}</td>
				<td>{this.props.store.name} {this.props.store.priority ? "("+this.props.store.priority+")" : null}</td>
				<td>{this.props.store.pincode}</td>
				<td>{this.props.store.phone}</td>
				<td>{this.props.store.address}</td>
				<td>
					{this.props.store.city.name}, <br/>
					{this.props.store.city.state}
				</td>
			</tr>
		);
	}
}

class StoreList extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		clientId: PropTypes.string.isRequired,
		children: PropTypes.node,
		stores: PropTypes.object,
	};

	state = {
		loading: false
	};

	componentDidMount() {
		this.setState({
			loading: true
		});
		this.props.dispatch(fetchStores(this.props.clientId)).always(()=>this.setState({loading:false}));
	}

	render() {
		if(this.state.loading){
			return <Loading/>;
		}
		var rows = [];
		let serial = 1;
		for(var id in this.props.stores) {
			rows.push(<StoreRow serial={serial++} store={this.props.stores[id]} key={id}/>);
		}
		return (
			<div>
				<div className="table-responsive">
					<table className="table table-striped">
						<thead>
							<tr>
								<th className="text-right">#</th>
								<th>Code</th>
								<th>Name</th>
								<th>Pincode</th>
								<th>Phone</th>
								<th>Address</th>
								<th>City</th>
							</tr>
						</thead>
						<tbody>
							{rows.length == 0 ? <tr>
								<td colSpan={7}>
									<Jumbotron para="Store list not found"></Jumbotron>
								</td>
							</tr> : null}
							{rows}

						</tbody>
					</table>
				</div>
			</div>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		stores: store.stores,
		clientId: store.clientId,
	};
};

export default ReactRedux.connect(mapStoreToProps)(StoreList);
