import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { pointerStyle } from "../../styles.js";

import DropDown, { DropDownDivider } from "../../components/DropDown.jsx";
import Heartbeat from "../../components/Heartbeat.jsx";
import NavLink from "../../components/NavLink.jsx";
import { OptionVertical, NewWindow, MapMarker, King, LogOut, Knight, Queen, Pawn, Wrench, Stats, Rook, File } from "../../components/Icons.jsx";

import floorwalkHeaderLogoUrl from "../../../img/logo_500x268.png";

export default class Header extends Component{
	static propTypes = {
		reportTab: PropTypes.bool.isRequired
	};

	static defaultProps = {
		reportTab: false,
	};

	state = {};

	render(){
		let brandStyle = {
			height: "40px",
			transform: "translateY(-25%)",
		};
		return (
			<nav className="navbar navbar-default navbar-static-top">
				<div className="container-fluid">
					<div className="navbar-header">
						<Link className="navbar-brand" to="/">
							<img className="img-responsive" style={brandStyle} alt="FloorWalk" title="FloorWalk" src={floorwalkHeaderLogoUrl}/>
						</Link>
					</div>
					<ul className="nav navbar-nav">
						<NavLink to="/client"><King/> <span className="hidden-xs">Clients</span></NavLink>
						<NavLink to="/auditor"><Pawn/> <span className="hidden-xs">Auditors</span></NavLink>
						<NavLink to="/agency_user"><Rook/> <span className="hidden-xs">Agency</span></NavLink>
						<NavLink to="/moderator/summary"><Knight/> <span className="hidden-xs">Moderators</span></NavLink>
						<NavLink to="/manager"><Queen/> <span className="hidden-xs">Managers</span></NavLink>
						{this.props.reportTab ? <NavLink to="/reports/auditor_payment"><Stats/> <span className="hidden-xs">Reports</span></NavLink> : null}
					</ul>
					<ul className="nav navbar-nav navbar-right">
						<li>
							<a>
								<Heartbeat/>
							</a>
						</li>
						<NavLink to="/country"><MapMarker/> <span className="hidden-xs">Cities</span></NavLink>
						<NavLink to="/proof_tag"><File/> <span className="hidden-xs">Proofs Tag</span></NavLink>
						<li>
							<a style={pointerStyle}
								onClick={(e)=>{e.stopPropagation(); this.logoutDropdown && this.logoutDropdown.toggle();}}>
								<OptionVertical/>
							</a>
							<DropDown ref={(d) => this.logoutDropdown=d}>
								<li>
									<a href="/admin" target="_blank">
										<Wrench/> Admin
									</a>
								</li>
								<li>
									<a href="https://msg91.com/signin" target="_blank" rel="noopener noreferrer">
										<NewWindow/> MSG91 SMS Portal
									</a>
								</li>
								<li>
									<a href="http://mbase.floorwalk.in:3000" target="_blank" rel="noopener noreferrer">
										<Stats/> Metabase
									</a>
								</li>
								<DropDownDivider/>
								<li>
									<a style={pointerStyle} onClick={() => this._logoutForm && this._logoutForm.submit()}>
										<LogOut/> <span className="">Logout</span>
									</a>
								</li>
							</DropDown>
						</li>
					</ul>
					<form style={{display:"none"}} action="/auth/manager/logout" method="POST" ref={r => this._logoutForm = r}/>
				</div>
			</nav>
		);
	}
}

