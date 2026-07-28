import React from "react";
import PropTypes from "prop-types";

import { Education } from "../../../components/Icons.jsx";
import NavLink from "../../../components/NavLink.jsx";

export default class TrainerIndex extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};
	render() {
		return (<div>
			<h2 className="page-header">
				<Education /> Trainers
			</h2>
			<ul className="nav nav-tabs">
				<NavLink to="/trainer/summary">Summary</NavLink>
				<NavLink to="/trainer/list">Manage</NavLink>
			</ul>
			<br />
			{this.props.children}
		</div>);
	}
}