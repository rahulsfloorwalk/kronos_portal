import React from 'react';
import { Link } from 'react-router';

import { pointerStyle } from '../../styles.js';

import Heartbeat from '../Heartbeat.jsx';
import NavLink from '../NavLink.jsx';
import { NewWindow, User, MapMarker, King, LogOut, Knight, Queen } from '../Icons.jsx';

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
						<NavLink to="/client"><King/> <span className="hidden-xs">Clients</span></NavLink>
						<NavLink to="/auditor"><User/> <span className="hidden-xs">Auditors</span></NavLink>
						<NavLink to="/moderator"><Knight/> <span className="hidden-xs">Moderators</span></NavLink>
						<NavLink to="/manager"><Queen/> <span className="hidden-xs">Managers</span></NavLink>
					</ul>
					<ul className="nav navbar-nav navbar-right">
						<li>
							<a>
							<Heartbeat/>
							</a>
						</li>
						<NavLink to="/state"><MapMarker/> <span className="hidden-xs">Cities</span></NavLink>
						<li className="hidden-xs">
							<a href="http://mbase.floorwalk.in:3000" target="_blank">
								<NewWindow/> Metabase
							</a>
						</li>
						<li>
							<a style={pointerStyle} onClick={() => this._logoutForm && this._logoutForm.submit()}>
								<LogOut/> <span className="">Logout</span>
							</a>
						</li>
					</ul>
					<form style={{display:"none"}} action="/auth/manager/logout" method="POST" ref={r => this._logoutForm = r}/>
				</div>
			</nav>
		);
	},
});

export default Header;


