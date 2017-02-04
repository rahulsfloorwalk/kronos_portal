import React from 'react';
import { Link } from 'react-router';

import NavLink from '../NavLink.jsx';

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
						<NavLink to="/details">My Profile</NavLink>
						<NavLink to="/audit">Audits</NavLink>
						<NavLink to="/audit_store">Reports</NavLink>
					</ul>
					<ul className="nav navbar-nav navbar-right">
						<li>
							<form action="/auth/logout" method="POST">
							<button className="btn btn-lg btn-link">
							Logout
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


