import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { Check, Cross, Pencil, Plus, File, King } from "../../../components/Icons.jsx";

import { findProofTag } from "../../service/proof_tag.js";

class ProofTagRow extends React.Component {
	static propTypes = {
		seq: PropTypes.number.isRequired,
		proof_tag: PropTypes.shape({
			id: PropTypes.number,
			name: PropTypes.string,
			description:PropTypes.string,
			is_active: PropTypes.bool,
		}),
	};
	render() {
		var is_active = this.props.proof_tag.is_active ? <Check/> : <Cross/>;
		return (
			<tr>
				<td className="text-right">{this.props.seq}</td>
				<td>{this.props.proof_tag.name}</td>
				<td>{this.props.proof_tag.description}</td>
				<td>{is_active}</td>
				<td>
					<Link to={`/proof_tag/${this.props.proof_tag.id}/edit`} className="btn btn-default"><Pencil/></Link>
				</td>
				<td>
					<Link to={`/proof_tag/${this.props.proof_tag.id}/client`} className="btn btn-default" title="Show Clients"><King/></Link>
				</td>
			</tr>
		);
	}
}

export default class ProofTagList extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};

	state = {
		proof_tags: [],
	};

	componentDidMount() {
		findProofTag().then((proof_tags) => {
			this.setState({
				proof_tags
			});
		});
	}

	componentWillReceiveProps() {
		this.componentDidMount();
	}

	render() {
		const rows = this.state.proof_tags.map((p,i) => <ProofTagRow seq={i+1} proof_tag={p} key={p.id}/>);
		const addProofTagLink = "/proof_tag/add";
		return (
			<div>
				<h2 className="page-header">
					<Link to={addProofTagLink} className="btn btn-default pull-right"><Plus/> Add Proof Tag</Link>
					<File/> Proofs Tag List
				</h2>
				<table className="table table-striped">
					<thead>
						<tr>
							<th className="text-right">#</th>
							<th>Proofs Tag</th>
							<th>Description</th>
							<th>Active</th>
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
