import React, { Component } from "react";
import PropTypes from "prop-types";

import { assignToModerator, revokeFromModerator } from "../service/audit_store.js";

export default class ModeratorAssignDropdown extends Component{
	static propTypes = {
		auditStoreId: PropTypes.number.isRequired,
		selectedModeratorId: PropTypes.arrayOf(PropTypes.number).isRequired,

		// moderators: PropTypes.arrayOf(PropTypes.shape({
		// 	id: PropTypes.number.isRequired,
		// 	email: PropTypes.string.isRequired,
		// 	is_active: PropTypes.bool.isRequired,
		// })),
		moderators: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			user: PropTypes.shape({
				email: PropTypes.string.isRequired,
				is_active: PropTypes.bool.isRequired,
			}).isRequired,
			is_active: PropTypes.bool.isRequired,
		})),

		onUpdate: PropTypes.func.isRequired,
	};

	state = {selectedId: this.props.selectedModeratorId[0] || ""};
	componentDidUpdate(prevProps) {
		if (prevProps.selectedModeratorId[0] !== this.props.selectedModeratorId[0]) {
			this.setState({ selectedId: this.props.selectedModeratorId[0] || "" });
		}
	}

	onChange = (e) => {
		const newId = e.target.value;
		this.setState({ selectedId: newId });

		if (newId) {
			assignToModerator(this.props.auditStoreId, newId).then((auditStore) => {
				this.props.onUpdate(auditStore);
			});
		} else {
			revokeFromModerator(this.props.auditStoreId).then((auditStore) => {
				this.props.onUpdate(auditStore);
			});
		}
	};
	render(){
		// let selectedId = this.props.selectedModeratorId[0] || "";
		const { selectedId } = this.state;
		return (<select className="form-control" onChange={this.onChange} value={selectedId}>
			<option value=""></option>
			{[...this.props.moderators]
				.sort((a, b) => {
					const aInactive =
						!a.is_active || !a.user.is_active;
					const bInactive =
						!b.is_active || !b.user.is_active;
					return aInactive - bInactive;
				})
				.map((m) => {
					const isInactive =
						!m.is_active || !m.user.is_active;
					const isCurrentlySelected =
						String(selectedId) === String(m.user.id);

					return (
						<option key={m.user.id} value={m.user.id} disabled={isInactive && !isCurrentlySelected}style={{color: isInactive ? "#999" : "#000",}}>
							{m.user.email}
							{isInactive ? " (Inactive)" : ""}
						</option>
					);
				})}
			{/* { this.props.moderators.filter((m) => m.user.is_active).map((m)=> <option key={m.user.id} value={m.user.id}>{m.user.email}</option>) } */}
			{/* { this.props.moderators.filter((m) => m.is_active).map((m)=> <option key={m.user.id} value={m.user.id}>{m.user.email}</option>) } */}
			{/* { this.props.moderators.filter((m) => m.is_active).map((m)=> <option key={m.id} value={m.id}>{m.email}</option>) } */}
		</select>);
	}
}
