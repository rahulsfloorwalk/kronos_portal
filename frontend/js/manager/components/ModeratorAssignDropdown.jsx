import React, { Component } from "react";
import PropTypes from "prop-types";

import { assignToModerator, revokeFromModerator } from "../service/audit_store.js";

export default class ModeratorAssignDropdown extends Component{
	static propTypes = {
		auditStoreId: PropTypes.number.isRequired,
		selectedModeratorId: PropTypes.arrayOf(PropTypes.number).isRequired,

		moderators: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			email: PropTypes.string.isRequired,
		})),

		onUpdate: PropTypes.func.isRequired,
	};

	state = {};

	onChange = (e) => {
		if(e.target.value){
			assignToModerator(this.props.auditStoreId, e.target.value).then((auditStore) => {
				this.props.onUpdate(auditStore);
			});
		} else {
			revokeFromModerator(this.props.auditStoreId).then((auditStore) => {
				this.props.onUpdate(auditStore);
			});
		}
	};
	render(){
		let selectedId = this.props.selectedModeratorId[0] || "";
		return (<select className="form-control" onChange={this.onChange} value={selectedId}>
			<option value=""></option>
			{ this.props.moderators.map((m)=> <option key={m.id} value={m.id}>{m.email}</option>) }
		</select>);
	}
}
