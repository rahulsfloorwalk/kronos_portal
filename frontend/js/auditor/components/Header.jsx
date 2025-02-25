import React from "react";
import { Link } from "react-router";

import { pointerStyle } from "../../styles.js";

import NavLink from "../../components/NavLink.jsx";

import { File,Flag, User, Inbox, LogOut, Tasks, Star } from "../../components/Icons.jsx";

import floorwalkLogoUrl from "../../../img/logo_500x268.png";
import GoogleTranslateWidget from "./GoogleTranslateWidget.jsx";
import { gettoken } from "../service/dashboard.js";
import CryptoJS from "crypto-js";
import { fetchConfig } from "../service/config.js";

class Header extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			userId : ""
		};
	}
	componentDidMount(){
		fetchConfig().then((config) => {
			this.setState({userId:config.USER_ID});
		});
	}
	handelredirect = () => {
		if (this.state.userId) {
			gettoken(this.state.userId).then((result) => {
				const Token = result.token;
				const secretKey = "e9w9r3q1w7d4f7t1g6c0s7v6c1x7z3b8m1y9e6a4q7e5t0r6n0l1p3u8a4z0h4!@#";
				const ciphertext = CryptoJS.AES.encrypt(Token, secretKey).toString();
				const encodedCiphertext = encodeURIComponent(ciphertext);
				window.open(`https://auditor.floorwalk.in/auditor/audit?token=${encodedCiphertext}`,"_blank");
			}, (err) => {
				this.setState({
					errMsg: err.responseJSON.non_field_errors[0],
				});
			});
		}
	};

	render() {
		let brandStyle = {
			height: "40px",
			transform: "translateY(-25%)",
		};
		return (
			<div>
				<div className="link-container">
					<p className="new" level={5}>Would you like to switch to our new view</p>
					<button className="new-btn" onClick={this.handelredirect}>Click here</button>
				</div>
				<nav className="navbar navbar-default navbar-static-top">
					<form style={{display:"none"}} action="/auth/logout" method="POST" ref={r => this._logoutForm = r}/>
					<div className="container">
						<div className="navbar-header">
							<Link className="navbar-brand" to="/">
								<img style={brandStyle} alt="FloorWalk" title="FloorWalk" src={floorwalkLogoUrl}/>
							</Link>
						</div>
						<ul className="nav navbar-nav">
							<NavLink to="/audit" className="audittourclass"><Inbox/> View Opportunities</NavLink>
							<NavLink to="/applied_audits" className="appliedauditsclass"><Flag/> Applied Audits</NavLink>
							<NavLink to="/audit_store" className="reporttourclass"><File/> Reports</NavLink>
							<NavLink to="/payment" className="paymenttourclass"><big><b>₹</b></big> Payments</NavLink>
							<NavLink to="/certification" className="certificationclass"><Star /> Certification</NavLink>
							<NavLink to="/shopper_guide/videos" className="guidetourclass"><Tasks/> Shopper Guide</NavLink>
							<NavLink to="/details" className="profiletourclass"><User/> My Profile</NavLink>
							{/* <NavLink to="/referral"><big><b>₹</b></big> Referrals</NavLink> */}
							{/* <NavLink to="/full_time_opportunity"><Star /> Full Time Opportunity</NavLink> */}
							{/* <NavLink to="/content_ninja"><Star /> Content Ninja</NavLink> */}
						</ul>
						<ul className="nav navbar-nav navbar-right">
							<li>
								<a style={pointerStyle} onClick={() => this._logoutForm && this._logoutForm.submit()}>
									<LogOut/> Logout
								</a>
							</li>
							<li style={{marginTop: "15px"}}>
								<GoogleTranslateWidget />

							</li>
						</ul>
					</div>
				</nav>
			</div>
		);
	}
}

export default Header;
