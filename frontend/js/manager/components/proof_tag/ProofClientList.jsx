import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { getClientsByProofTagId } from "../../service/proof_tag.js";

import Modal from "../../../components/Modal.jsx";
import Loading from "../../../components/Loading.jsx";

export default class ProofClientList extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			proof_tag_id: PropTypes.string,
		}),
	};
	state = {
		loading: false,
		proof_clients: []
	};
	componentDidMount() {
		if(this.props.params.proof_tag_id){
			this.setState({laoding:true});
			getClientsByProofTagId(this.props.params.proof_tag_id).then( (proof_clients) => {
				this.setState({
					proof_clients: proof_clients,
					loading:false
				});
			});
		}
	}
	render() {
		if(this.state.loading){
			return (<Loading/>);
		}
		return (
			<Modal modalTitle='Client List' onClose={hashHistory.goBack}>
				<table className="table table-striped">
					<thead>
						<tr>
							<th className="text-right">#</th>
							<th>ID</th>
							<th>Name</th>
							<th>Brand Name</th>
						</tr>
					</thead>
					<tbody>
						{this.state.proof_clients.map((p,i)=>(
							<tr key={i}>
								<td>{i+1}</td>
								<td>{p.id}</td>
								<td>{p.name}</td>
								<td>{p.brand_name}</td>
							</tr>
						))}
					</tbody>
				</table>
			</Modal>
		);
	}
}
