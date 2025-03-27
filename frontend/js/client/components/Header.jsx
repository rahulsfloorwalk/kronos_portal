import React from "react";
import PropTypes from "prop-types";
import { Link, hashHistory } from "react-router";

import { pointerStyle } from "../../styles.js";

import NavLink from "../../components/NavLink.jsx";
import { Dashboard, File, LogOut, Time, Retweet, Home, Bell } from "../../components/Icons.jsx";

import floorwalkLogoUrl from "../../../img/logo_500x300.png";

import { fetchUser } from "../service/user.js";

import GoogleTranslateWidget from "../../auditor/components/GoogleTranslateWidget.jsx";
import bookiconimg from "../../../img/bookmark-with-star.jpg";
import { gettoken } from "../service/dashboard.js";
import CryptoJS from "crypto-js";

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
				hashHistory.push("/dashboard");
			}
		});
	}

	componentWillReceiveProps(nextProps) {
		if( this.state.clientUser && nextProps.location.pathname === "/"){
			hashHistory.push("/dashboard");
		}
	}

	handelredirect = () => {
		if (Object.entries(this.state.clientUser).length > 0) {
			gettoken(this.state.clientUser.user.id).then((result) => {
				const Token = result.token;
				const secretKey = "e9w9r3q1w7d4f7t1g6c0s7v6c1x7z3b8m1y9e6a4q7e5t0r6n0l1p3u8a4z0c1!@#";
				const ciphertext = CryptoJS.AES.encrypt(Token, secretKey).toString();
				const encodedCiphertext = encodeURIComponent(ciphertext);
				// window.open(`https://client.floorwalk.in/?token=${encodedCiphertext}`, "_blank");
				window.open(`https://client.floorwalk.in/?token=${encodedCiphertext}`, "_blank");
			}, (err) => {
				this.setState({
					errMsg: err.responseJSON.non_field_errors[0],
				});
			});
		}
	};

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
		let imgUrl = this.state.clientUser && this.state.clientUser.client && this.state.clientUser.client.logo_url ?  this.state.clientUser.client.logo_url : floorwalkLogoUrl;
		let clientName = this.state.clientUser ? this.state.clientUser.client.name : "FloorWalk";
		return (
			<>
				{!(this.state.clientUser.client.id ==344 ||  this.state.clientUser.client.id==345 || this.state.clientUser.client.id==346) &&
				<div className="link-container">
					<p className="new" level={5}>Would you like to switch to our new view</p>
					<button className="new-btn" onClick={this.handelredirect}>Click here</button>
				</div>}
				<div className="container-fluid">
					<div className="text-center">
						<Link to="/">
							<img style={brandStyle} alt={clientName} title={clientName} src={imgUrl}/>
						</Link>
						{/* <button onClick={this.handelredirect}>new_portal</button> */}
					</div>
					<nav className="navbar navbar-default hidden-print">
						<div className="navbar-header">
						</div>
						<ul className="nav navbar-nav">
							<NavLink to="/dashboard"><Dashboard/> Dashboard</NavLink>
							<NavLink to="/browser3"><File/> Report Browser</NavLink>
							<NavLink to="/action_reports"><File/> Action Plan Tracking</NavLink>
							<NavLink to="/store"><Home/> Store Browser</NavLink>
							{ this.state.clientUser.client.id === 23 ?
								<NavLink to="/weighted_browser"><File/> Weighted Reports</NavLink>
								: null }
							{/* { this.state.clientUser.is_client_admin ?
							<NavLink to="/store"><Home/> Store Browser</NavLink>
							: null } */}
							{ this.state.clientUser.is_client_admin ?
								<NavLink to="/store_performance"><File/> Store Performance</NavLink>
								: null }
							{ this.state.clientUser.is_client_admin ?
								<NavLink to="/upcoming"><Time/> Upcoming Audits</NavLink>
								: "" }
							{/* { this.state.clientUser.is_client_admin ?
							<NavLink to="/twitter"><Retweet/> Twitter</NavLink>
							: null } */}
							{this.state.clientUser.is_client_admin ?
								<li style={{position:"relative"}} className="navbar-nav nav">
									<NavLink to="/aiinsights"> <Retweet  /> AI Insights<span style={{marginRight: "8px"}}></span></NavLink>
									<img src={bookiconimg} alt="" style={{width:"16px",position:"absolute",top:0,right:0,mixBlendMode:"multiply"}}/>
								</li>
								: null}
						</ul>
						<ul className="nav navbar-nav navbar-right">
							{ this.state.clientUser.is_client_admin ?
								<li>
									<Link to="/email_notification">
										<Bell/> Receive Email Notification
										&nbsp;
										&nbsp;
									</Link>
								</li>
								:
								null
							}

							<li style={{marginTop: "15px"}}>
								<GoogleTranslateWidget />
							</li>

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
			</>
		);
	}
}



