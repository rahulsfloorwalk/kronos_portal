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
			this.setState({loading:true});
			getClientsByProofTagId(this.props.params.proof_tag_id).then( (proof_clients) => {
				this.setState({
					proof_clients: proof_clients,
					loading:false
				});
			});
		}
	}
	render() {
		let rows= this.state.proof_clients.map((m,index)=>{
			return(
				<tr key={index}>
					<td>{m.id}</td>
					<td>{m.name}</td>
				</tr>
			);
		});
		return (
			<Modal modalTitle='Client List' onClose={hashHistory.goBack}>
				{this.state.loading ? <Loading/> :
					rows.length>0 ?
						(
							<table className="table table-striped">
								<thead>
									<tr>
										<th>ID</th>
										<th>Name</th>
									</tr>
								</thead>
								<tbody>
									{rows}
								</tbody>
							</table>
						)
						: <div>Proof Tag is Not Assigned For Any Client</div>}
			</Modal>
		);
	}
}
