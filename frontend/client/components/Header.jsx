import React from 'react';
import { Link } from 'react-router';

import NavLink from '../../js/components/NavLink.jsx';
import { Home, MapMarker, King, LogOut } from '../../js/components/Icons.jsx';

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
						<NavLink to="/"><King/> Home</NavLink>
						<NavLink to="/store"><Home/> Stores</NavLink>
					</ul>
					<ul className="nav navbar-nav navbar-right">
						<li>
							<form action="/auth/client/logout" method="POST">
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


