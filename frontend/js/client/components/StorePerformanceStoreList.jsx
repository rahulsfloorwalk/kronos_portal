import React from "react";
import PropTypes from "prop-types";
import { hashHistory , Link } from "react-router";

import Modal from "../../components/Modal.jsx";

import { findStoresByPercentage } from "../service/report_performance_store_list.js";

import Loading from "../../components/Loading.jsx";

class StoreListRow extends React.Component {
	static propTypes = {
		seq: PropTypes.number.isRequired,
		store: PropTypes.object,
	};

	render() {
		return (

			<tr key={this.props.store.id}>
				<td className="text-right">{this.props.seq}</td>
				<td>{this.props.store.code}</td>
				<td>{this.props.store.name}</td>
				<td>{this.props.store.city}</td>
				<td><Link to={`/store/${this.props.store.id}/reports`} target="_blank"><button type="button" className="btn btn-default">View</button></Link></td>
			</tr>
		);
	}
}

export default class StorePerformanceStoreList extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			audit_cycle_id: PropTypes.string,
			section_id : PropTypes.string,
			percentage: PropTypes.string
		})
	};

	state = {
		storeList : null,
		loading: false,
		section_name : "",
		audit_cycle_name: ""
	};

    setLoading = (loading) => {
		this.setState(prevState => {
			return Object.assign({},prevState,{
				loading
			});
		});
	};

	componentDidMount() {
		this.setLoading(true);
		findStoresByPercentage(this.props.params.audit_cycle_id, this.props.params.section_id, this.props.params.percentage).then((store_list) => {
			this.setState({
				storeList: store_list,
				section_name: store_list["section_name"],
				audit_cycle_name: store_list["audit_cycle_name"]
			});
		}).always(() => this.setLoading(false));
	}

	render() {
		var modalTitle = `Store List of ${this.state.audit_cycle_name} ${this.state.section_name}`;
		var modalSize = "modal-lg";
		let loading_element;
		if(this.state.loading){
			loading_element = <Loading/>;
		}
		else{
			loading_element = null;
		}
		let rows = null;
		if(this.state.storeList){
			rows = this.state.storeList["store_list"].map((m, i) => <StoreListRow seq={i+1} store={m} key={m.id}/>);
		}

		return (
			<Modal modalTitle={modalTitle} size={modalSize} onClose={hashHistory.goBack}>
				<table className="table table-bordered table-hover table-striped">
					<thead>
						<tr>
							<th>Sr No.</th>
							<th>Store Code</th>
							<th>Store Name</th>
							<th>City</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
					{rows}
					</tbody>
				</table>
				{loading_element}
			</Modal>
		);
	}
}
