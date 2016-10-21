import React from 'react';
import { Link } from 'react-router';

var Header = React.createClass({
	render: function(){
		return (
			<nav className="navbar navbar-default navbar-static-top">
				<div className="container">
					<div className="navbar-header">
						<Link className="navbar-brand" to="/">Vitric</Link>
					</div>
					<ul className="nav navbar-nav">
						<li><Link to="/client" activeClassName="active">Client</Link></li>
					</ul>
					<ul className="nav navbar-nav">
						<li><Link to="/auditor" activeClassName="active">Auditor</Link></li>
					</ul>
					<ul className="nav navbar-nav">
						<li><Link to="/location" activeClassName="active">Location</Link></li>
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


