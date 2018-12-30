import React, { Component } from "react";
import PropTypes from "prop-types";

import { findIdProofsForUser } from "../../service/id_proofs.js";

import Loading from "../../../components/Loading.jsx";

export default class AuditorIdProof extends Component{
	static propTypes = {
		params: PropTypes.shape({
			auditorId: PropTypes.string.isRequired,
		}),
	};

	constructor(props){
		super(props);
		this.state = {
			loading: true,
			id_proofs: [],
		};
	}

	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	};

	reloadData = (user_id) => {
		this.setLoading(true);
		findIdProofsForUser(user_id).then((id_proofs)=> this.setState({ id_proofs })).always(() => this.setLoading(false));
	};

	componentDidMount(){
		this.reloadData(this.props.params.auditorId);
	}

	componentWillReceiveProps = (nextProps) => {
		this.reloadData(nextProps.params.auditorId);
	};

	render(){
		if(this.state.loading){
			return <Loading/>;
		}
		let idProofRows = this.state.id_proofs.map(e => {
			return (<tr key={e.id}>
				<td>{e.file_name}</td>
				<td><a href={e.direct_url} className="btn btn-default" target="_blank">View File</a></td>
			</tr>);
		});

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h4 className="panel-title">ID Proofs</h4>
				</div>
				<table className="table table-striped table-hover">
					<tbody>
						<tr>
							<th>File name</th>
							<th>File Location</th>
						</tr>
						{idProofRows}
					</tbody>
				</table>
			</div>
		);
	}
}
