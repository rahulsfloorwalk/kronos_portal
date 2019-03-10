import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { Check, Cross, Pencil, Plus } from "../../../components/Icons.jsx";

import { findModerators } from "../../service/moderator.js";

class ModeratorRow extends React.Component {
	static propTypes = {
		seq: PropTypes.number.isRequired,
		moderator: PropTypes.shape({
			id: PropTypes.number,
			is_active: PropTypes.bool,
			email: PropTypes.string,
		}),
	};

	render() {
		var is_active = this.props.moderator.is_active ? <Check/> : <Cross/>;
		return (
			<tr>
				<td className="text-right">{this.props.seq}</td>
				<td>{this.props.moderator.email}</td>
				<td>{is_active}</td>
				<td>
					<Link to={`/moderator/list/${this.props.moderator.id}/edit`} className="btn btn-default"><Pencil/></Link>
				</td>
			</tr>
		);
	}
}

export default class ModeratorList extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};

	state = {
		moderators: [],
	};

	componentDidMount() {
		findModerators().then((moderators) => {
			this.setState({
				moderators
			});
		});
	}

	componentWillReceiveProps() {
		this.componentDidMount();
	}

	render() {
		const rows = this.state.moderators.map((m, i) => <ModeratorRow seq={i+1} moderator={m} key={m.id}/>);
		const addModeratorLink = "/moderator/list/add";
		return (
			<div>
				<table className="table table-striped">
					<thead>
						<tr>
							<th className="text-right">#</th>
							<th>Email Address</th>
							<th>Active</th>
							<th>
								<Link to={addModeratorLink}
									className="btn btn-default pull-right">
									<Plus/> Add Moderator
								</Link>
							</th>
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
