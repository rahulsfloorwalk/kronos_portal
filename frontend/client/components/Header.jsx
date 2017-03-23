import React from 'react';
import { Link } from 'react-router';

import NavLink from '../../js/components/NavLink.jsx';
import { Dashboard, Home, MapMarker, King, LogOut } from '../../js/components/Icons.jsx';

import { fetchUser } from '../service/user.js';

export default React.createClass({
	getInitialState: function(){
		return {
			clientUser: null
		};
	},
	componentDidMount: function(){
		fetchUser().then((clientUser)=>{
			this.setState({
				clientUser
			});
		});
	},
	render: function(){
		let brandStyle = {
			maxHeight: "80px",
			marginLeft: "auto",
			marginRight: "auto",
			marginTop: "2px",
			marginBottom: "2px",
		};
		let imgUrl = this.state.clientUser && this.state.clientUser.client && this.state.clientUser.client.logo_url ?  this.state.clientUser.client.logo_url : "/static/img/logo_3_transparent_bg_400x51.png";
		let clientName = this.state.clientUser ? this.state.clientUser.client.name : "FloorWalk";
		return (
			<div className="container">
				<div className="text-center">
					<Link to="/">
						<img style={brandStyle} alt={clientName} title={clientName} src={imgUrl}/>
					</Link>
				</div>
				<nav className="navbar navbar-default hidden-print">
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



