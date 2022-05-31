import React from "react";
import * as ReactRedux from "react-redux";
import PropTypes from "prop-types";
import { Link, hashHistory } from "react-router";

import { pointerStyle } from "../../styles.js";
import DropDown, { DropDownDivider } from "../../components/DropDown.jsx";

import NavLink from "../../components/NavLink.jsx";
import { Dashboard, File, LogOut, Bell, Stats } from "../../components/Icons.jsx";

import { fetchUser } from "../service/user.js";
import { fetchClient } from "../actions/client.js";

class Header extends React.Component {
	static propTypes = {
		location: PropTypes.shape({
			pathname: PropTypes.string.isRequired,
		}).isRequired,
		clientId: PropTypes.number,
		fetchClient: PropTypes.func.isRequired,
		// fetchAccountBalance: PropTypes.func.isRequired,
		// accountBalance: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
	};

	state = {
		clientUser: null
	};

	componentDidMount() {
		this.props.fetchClient();
		// this.props.fetchAccountBalance();
		fetchUser().then((clientUser)=>{
			if(clientUser.is_client_admin == false){
				window.location.replace("/auth/client/login");
			}
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

	render() {
		if(! this.state.clientUser){
			return null;
		}

		return (
			<nav className="navbar navbar-default navbar-static-top hidden-print">
				<div className="navbar-header">
				</div>
				<ul className="nav navbar-nav">
					<NavLink to="/dashboard"><Dashboard/> Dashboard</NavLink>
					<NavLink to={`/projects/${this.props.clientId}/audit_cycle`}><File/> Projects</NavLink>
					<li role="presentation">
						<a href="/static/client/index.html" target="_blank" ><File/> Reports</a>
					</li>
					<NavLink to="/quotation"><File/> Quotation</NavLink>
				</ul>
				<ul className="nav navbar-nav navbar-right" style={{marginRight:"0px"}}>
					{/* <li style={{display: "flex", alignItems: "center", border: "solid 1px lightgrey", padding: "0px 5px"}}>
						<b title="Remaining balance">&#8377; {this.props.accountBalance}</b>&nbsp;&nbsp;
						<Link to="/payment" className="btn btn-sm btn-default" style={{padding:"5px", margin:"9px 0px"}}>Top Up</Link>
					</li> */}
					<li>
						<a style={pointerStyle}
							onClick={(e)=>{e.stopPropagation(); this.logoutDropdown && this.logoutDropdown.toggle();}}>
							<span><Stats/> My Account&nbsp;&nbsp;</span>
						</a>
						<DropDown ref={(d) => this.logoutDropdown=d}>
							<li>
								<Link to="/profile">
									<Stats/> My Profile
								</Link>
							</li>
							<li>
								<Link to="/billing">
									<Stats/> Billing
								</Link>
							</li>
							<li>
								<Link to="/faq">
									<Stats/> FAQ
								</Link>
							</li>
							<li>
								<Link to="/contact_us">
									<Stats/> Contact us
								</Link>
							</li>
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
							<DropDownDivider/>
							<li>
								<a style={pointerStyle} onClick={() => this._logoutForm && this._logoutForm.submit()}>
									<LogOut/> <span className="">Logout</span>
								</a>
							</li>
						</DropDown>
					</li>
				</ul>
				<form style={{display:"none"}} action="/auth/client/logout" method="POST" ref={r => this._logoutForm = r}/>
			</nav>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		clientId: store.client.id,
		// accountBalance: store.account.balance,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		fetchClient: () => {
			dispatch(fetchClient());
		},
		// fetchAccountBalance: () =>{
		// 	dispatch(fetchAccountBalance());
		// }
	};
};

export default ReactRedux.connect(mapStoreToProps, mapDispatchToProps)(Header);