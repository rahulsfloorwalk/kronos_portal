import React from 'react';
import { Link } from 'react-router';

import NavLink from '../NavLink.jsx';

import { File, User, Inbox } from '../Icons.jsx';

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
						<NavLink to="/details"><User/> My Profile</NavLink>
						<NavLink to="/audit"><Inbox/> Audits</NavLink>
						<NavLink to="/audit_store"><File/> Reports</NavLink>
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


