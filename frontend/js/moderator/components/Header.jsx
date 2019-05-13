import React from "react";
import { hashHistory } from "react-router";

import { pointerStyle } from "../../styles.js";

import { Hourglass, Checked } from "../../components/Icons.jsx";
import NavLink from "../../components/NavLink.jsx";

import { logout } from "../service/auth.js";

import floorwalkHeaderLogoUrl from "../../../img/logo_500x268.png";

export default class Header extends React.Component {
	performLogout = () => {
		logout().then(() => {
			hashHistory.push("/login?logout=true");
		});
	};

	render() {
		let brandStyle = {
			height: "40px",
			transform: "translateY(-25%)",
		};
		return (
			<nav className="navbar navbar-default navbar-static-top">
				<div className="container">
					<div className="navbar-header">
						<a className="navbar-brand">
							<img className="img-responsive" style={brandStyle} alt="FloorWalk" title="FloorWalk" src={floorwalkHeaderLogoUrl}/>
						</a>
					</div>
					<ul className="nav navbar-nav">
						<NavLink to="/?type=qa_pending"><Hourglass/> QA Pending</NavLink>
						<NavLink to="/?type=qa_done"><Checked/> QA Complete</NavLink>
					</ul>
					<ul className="nav navbar-nav navbar-right">
						<li>
							<a style={pointerStyle} onClick={this.performLogout}>Logout</a>
						</li>
					</ul>
				</div>
			</nav>
		);
	}
}

