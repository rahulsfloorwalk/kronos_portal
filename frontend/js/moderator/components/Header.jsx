import React from 'react';
import { Link, hashHistory } from 'react-router';

import { pointerStyle } from '../../styles.js';

import { Hourglass, Checked } from '../../components/Icons.jsx';
import NavLink from '../../components/NavLink.jsx';

import { logout } from '../service/auth.js';

export default React.createClass({
	performLogout: function(){
		logout().then(() => {
			hashHistory.push("/login?logout=true");
		});
	},
	render: function(){
		let brandStyle = {
			height: "25px"
		};
		return (
			<nav className="navbar navbar-default navbar-static-top">
				<div className="container">
					<div className="navbar-header">
						<a className="navbar-brand">
							<img className="img-responsive" style={brandStyle} alt="FloorWalk" title="FloorWalk" src="/static/img/logo_3_transparent_bg_400x51.png"/>
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
	},
});

