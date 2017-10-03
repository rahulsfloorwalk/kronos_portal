import React from 'react';
import { Link } from 'react-router';

import { pointerStyle } from '../../styles.js';

import NavLink from '../NavLink.jsx';

import { File, User, Inbox, LogOut } from '../Icons.jsx';


var Header = React.createClass({
	render: function(){
		let brandStyle = {
			height: "25px"
		};
		return (
			<nav className="navbar navbar-default navbar-static-top">
				<form style={{display:"none"}} action="/auth/logout" method="POST" ref={r => this._logoutForm = r}/>
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
						<NavLink to="/payment"><big><b>₹</b></big> Payments</NavLink>
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
	},
});

export default Header;


