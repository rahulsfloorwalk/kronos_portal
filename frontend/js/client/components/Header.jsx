import React from "react";
import PropTypes from "prop-types";
import { Link, hashHistory } from "react-router";

import { pointerStyle } from "../../styles.js";

import NavLink from "../../components/NavLink.jsx";
import { Dashboard, File, LogOut, Time, Retweet, Home } from "../../components/Icons.jsx";

import { fetchUser } from "../service/user.js";

export default class Header extends React.Component {
	static propTypes = {
		location: PropTypes.shape({
			pathname: PropTypes.string.isRequired,
		}).isRequired,
	};

	state = {
		clientUser: null
	};

	componentDidMount() {
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
	}

	componentWillReceiveProps(nextProps) {
		if( this.state.clientUser && nextProps.location.pathname === "/"){
			if(this.state.clientUser.is_client_admin){
				hashHistory.push("/dashboard");
			} else {
				hashHistory.push("/browser3");
			}
		}
	}

	render() {
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
			<div className="container-fluid">
				<div className="text-center">
					<Link to="/">
						<img style={brandStyle} alt={clientName} title={clientName} src={imgUrl}/>
					</Link>
				</div>
				<nav className="navbar navbar-default hidden-print">
					<div className="navbar-header">
					</div>
					<ul className="nav navbar-nav">
						<NavLink to="/dashboard"><Dashboard/> Dashboard</NavLink>
						<NavLink to="/browser3"><File/> Report Browser</NavLink>
						{ this.state.clientUser.client.id === 23 ?
							<NavLink to="/weighted_browser"><File/> Weighted Reports</NavLink>
							: null }
						{ this.state.clientUser.is_client_admin ?
							<NavLink to="/store"><Home/> Store Browser</NavLink>
							: null }
						{ this.state.clientUser.is_client_admin ?
							<NavLink to="/upcoming"><Time/> Upcoming Audits</NavLink>
							: "" }
						{ this.state.clientUser.is_client_admin ?
							<NavLink to="/twitter"><Retweet/> Twitter</NavLink>
							: null }
					</ul>
					<ul className="nav navbar-nav navbar-right">
						<li>
							<a style={pointerStyle} onClick={() => this._logoutForm && this._logoutForm.submit()}>
								<LogOut/> Logout
								&nbsp;
								&nbsp;
							</a>
						</li>
					</ul>
					<form style={{display:"none"}} action="/auth/client/logout" method="POST" ref={r => this._logoutForm = r}/>
				</nav>
			</div>
		);
	}
}



