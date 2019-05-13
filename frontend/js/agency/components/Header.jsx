import React from "react";
import { Link } from "react-router";

import { pointerStyle } from "../../styles.js";

import NavLink from "../../components/NavLink.jsx";

import { Home, File, LogOut } from "../../components/Icons.jsx";

import floorwalkLogoUrl from "../../../img/logo_500x268.png";

export default class Header extends React.Component{
	render(){
		let brandStyle = {
			height: "40px",
			transform: "translateY(-25%)",
		};
		return (
			<nav className="navbar navbar-default navbar-static-top">
				<form style={{display:"none"}} action="/auth/agency/logout" method="POST" ref={r => this._logoutForm = r}/>
				<div className="container">
					<div className="navbar-header">
						<Link className="navbar-brand" to="/">
							<img className="img-responsive" style={brandStyle} alt="FloorWalk" title="FloorWalk" src={floorwalkLogoUrl}/>
						</Link>
					</div>
					<ul className="nav navbar-nav">
						<NavLink to="/"><Home/> Home</NavLink>
						<NavLink to="/reports"><File/> Reports</NavLink>
					</ul>
					<ul className="nav navbar-nav navbar-right">
						<li>
							<a style={pointerStyle} onClick={() => this._logoutForm && this._logoutForm.submit()}>
								<LogOut/> Logout
							</a>
						</li>
					</ul>
				</div>
			</nav>
		);
	}
}
