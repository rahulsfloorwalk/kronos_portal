import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { Check, Cross, Knight, HandRight } from "../../components/Icons.jsx";

import { findByAuditCycle, revoke } from "../service/moderator.js";

class ModeratorRow extends React.Component {
	static propTypes = {
		moderator: PropTypes.shape({
			is_active: PropTypes.bool,
			email: PropTypes.string,
		}),
		onRevoke: PropTypes.func,
	};
	render() {
		var is_active = this.props.moderator.is_active ? <Check/> : <Cross/>;
		return (
			<tr>
				<td>{this.props.moderator.email}</td>
				<td>{is_active}</td>
				<td>
					<button onClick={() => this.props.onRevoke(this.props.moderator)} className="btn btn-default" title="Revoke"><Cross/></button>
				</td>
			</tr>
		);
	}
}

export default class AuditCycleModeratorList extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}),
		children: PropTypes.node,
	};
	state = {
		moderators: [],
	};

	componentDidMount() {
		findByAuditCycle(this.props.params.auditCycleId).then((moderators) => {
			this.setState({
				moderators
			});
		});
	}

	componentWillReceiveProps() {
		this.componentDidMount();
	}

	revokeClicked = (moderator) => {
		revoke(this.props.params.auditCycleId, moderator.id).then(() => {
			this.componentDidMount();
		});
	};

	render() {
		let rows = [];
		for(let moderator of this.state.moderators) {
			rows.push(<ModeratorRow moderator={moderator} key={moderator.id} onRevoke={this.revokeClicked}/>);
		}
		if(rows.length === 0){
			rows.push(<tr key="empty"><td colSpan="3" className="text-center text-muted">no moderators assigned</td></tr>);
		}
		var addModeratorLink = `/audit_cycle/${this.props.params.auditCycleId}/moderator/assign`;
		return (
			<div>
				<h3 className="page-header">
					<Link to={addModeratorLink} className="btn btn-default pull-right"><HandRight/> Assign</Link>
					<Knight/> Moderators
				</h3>
				<table className="table table-striped">
					<thead>
						<tr>
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
