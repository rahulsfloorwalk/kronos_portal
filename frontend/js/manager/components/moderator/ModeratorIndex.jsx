import React from "react";
import PropTypes from "prop-types";

import { Knight } from "../../../components/Icons.jsx";
import NavLink from "../../../components/NavLink.jsx";

export default class ModeratorIndex extends React.Component{
	static propTypes = {
		children: PropTypes.node,
	};
	render(){
		return (<div>
			<h2 className="page-header">
				<Knight/> Moderators
			</h2>
			<ul className="nav nav-tabs">
				<NavLink to="/moderator/summary">Summary</NavLink>
				<NavLink to="/moderator/list">Manage</NavLink>
			</ul>
			<br/>
			{this.props.children}
		</div>);
	}
}
