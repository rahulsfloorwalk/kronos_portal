import React from 'react';
import { Link } from 'react-router';

import NavLink from '../../js/components/NavLink.jsx';
import { Dashboard, Home, MapMarker, King, LogOut } from '../../js/components/Icons.jsx';

var Header = React.createClass({
	render: function(){
		let brandStyle = {
			height: "30px",
			marginLeft: "auto",
			marginRight: "auto",
			marginTop: "20px",
			marginBottom: "20px",
		};
		return (
			<div className="container">
				<div className="text-center">
					<Link to="/">
						<img className="" style={brandStyle} alt="FloorWalk" title="FloorWalk" src="/static/img/logo_3_transparent_bg_400x51.png"/>
					</Link>
				</div>
				<nav className="navbar navbar-default">
					<div className="navbar-header">
					</div>
					<ul className="nav navbar-nav">
						<NavLink to="/"><Dashboard/> Dashboard</NavLink>
						<NavLink to="/store"><Home/> Store Browser</NavLink>
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
				</nav>
			</div>
		);
	},
});

export default Header;


