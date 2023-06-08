import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { Check, Cross, Education, Pencil, Plus } from "../../../components/Icons.jsx";

import { findTrainers } from "../../service/trainer.js";

class TrainerRow extends React.Component {
	static propTypes = {
		seq: PropTypes.number.isRequired,
		trainer: PropTypes.shape({
			id: PropTypes.number,
			email: PropTypes.string,
			is_active: PropTypes.bool,
		}),
	};
	render() {
		var is_active = this.props.trainer.is_active ? <Check/> : <Cross/>;
		return (
			<tr>
				<td className="text-right">{this.props.seq}</td>
				<td>{this.props.trainer.email}</td>
				<td>{is_active}</td>
				<td>
					<Link to={`/trainer/${this.props.trainer.id}/edit`} className="btn btn-default"><Pencil/></Link>
				</td>
			</tr>
		);
	}
}

export default class TrainerList extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};

	state = {
		trainers: [],
	};

	componentDidMount() {
		findTrainers().then((trainers) => {
			this.setState({
				trainers
			});
		});
	}

	componentWillReceiveProps() {
		this.componentDidMount();
	}

	render() {
		const rows = this.state.trainers.map((m,i) => <TrainerRow seq={i+1} trainer={m} key={m.id}/>);
		const addTrainerLink = "/trainer/add";
		return (
			<div className="table-responsive">
				<h2 className="page-header">
					<Link to={addTrainerLink} className="btn btn-default pull-right"><Plus/> Add Trainer</Link>
					<Education/> Trainer
				</h2>
				<table className="table table-striped">
					<thead>
						<tr>
							<th className="text-right">#</th>
							<th>Email Address</th>
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
