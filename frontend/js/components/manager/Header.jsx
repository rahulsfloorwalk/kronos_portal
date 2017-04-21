import React from 'react';
import { Link } from 'react-router';

import Heartbeat from '../Heartbeat.jsx';
import NavLink from '../NavLink.jsx';
import { NewWindow, User, MapMarker, King, LogOut } from '../Icons.jsx';

var Header = React.createClass({
	render: function(){
		let brandStyle = {
			height: "25px"
		};
		return (
			<nav className="navbar navbar-default navbar-static-top">
				<div className="container">
					<div className="navbar-header">
						<Link className="navbar-brand" to="/">
							<img className="img-responsive" style={brandStyle} alt="FloorWalk" title="FloorWalk" src="/static/img/logo_3_transparent_bg_400x51.png"/>
						</Link>
					</div>
					<ul className="nav navbar-nav">
						<NavLink to="/client"><King/> Clients</NavLink>
						<NavLink to="/auditor"><User/> Auditors</NavLink>
						<NavLink to="/state"><MapMarker/> Locations</NavLink>
					</ul>
					<ul className="nav navbar-nav navbar-right">
						<li>
							<a>
							<Heartbeat/>
							</a>
						</li>
						<li>
							<a href="http://mbase.floorwalk.in:3000" target="_blank">
								<NewWindow/> Metabase
							</a>
						</li>
						<li>
							<form action="/auth/logout" method="POST">
							<button className="btn btn-lg btn-link">
							<LogOut/> Logout
							</button>
							</form>
						</li>
					</ul>
				</div>
			</nav>
		);
	},
});

export default Header;


