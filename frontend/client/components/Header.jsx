import React from 'react';
import { Link, hashHistory } from 'react-router';

import NavLink from '../../js/components/NavLink.jsx';
import { Dashboard, File, LogOut, Time } from '../../js/components/Icons.jsx';

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
			if( this.props.location.pathname === "/"){
				if(clientUser.is_client_admin){
					hashHistory.push("/dashboard");
				} else {
					hashHistory.push("/browser3");
				}
			}
		});
	},
	componentWillReceiveProps: function(nextProps){
		if( this.state.clientUser && nextProps.location.pathname === "/"){
			if(this.state.clientUser.is_client_admin){
				hashHistory.push("/dashboard");
			} else {
				hashHistory.push("/browser3");
			}
		}
	},
	render: function(){
		if(! this.state.clientUser){
			return null;
		}
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
						{
							this.state.clientUser.is_client_admin
							? <NavLink to="/dashboard"><Dashboard/> Dashboard</NavLink>
							: ""
						}
						{/*<NavLink to="/browser"><File/> Report Browser</NavLink>*/}
						<NavLink to="/browser3"><File/> Report Browser</NavLink>
						{
							this.state.clientUser.is_client_admin
							? <NavLink to="/upcoming"><Time/> Upcoming Audits</NavLink>
							: ""
						}
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



