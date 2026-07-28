import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { pointerStyle } from "../../styles.js";

import DropDown, { DropDownDivider } from "../../components/DropDown.jsx";
import Heartbeat from "../../components/Heartbeat.jsx";
import NavLink from "../../components/NavLink.jsx";
import { OptionVertical, NewWindow, MapMarker, King, LogOut, Knight, Queen, Pawn, Wrench, Stats, File, Pencil, Education } from "../../components/Icons.jsx";
import { findManagerProfile } from "../service/manager.js";
import floorwalkHeaderLogoUrl from "../../../img/logo_500x268.png";

export default class Header extends Component{
	static propTypes = {
		reportTab: PropTypes.bool.isRequired
	};

	static defaultProps = {
		reportTab: false,
	};

	state = {
		managers: {},
	};

	componentDidMount() {
		findManagerProfile().then((managers) => {
			this.setState({
				managers
			});
		});
	}

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
					{this.state.managers.is_admin ?
						<ul className="nav navbar-nav">
							<NavLink to="/client"><King/> <span className="hidden-xs">Clients</span></NavLink>
							<NavLink to="/auditor"><Pawn/> <span className="hidden-xs">Auditors</span></NavLink>
							{/* <NavLink to="/agency_user"><Rook/> <span className="hidden-xs">Agency</span></NavLink> */}
							<NavLink to="/moderator/summary"><Knight/> <span className="hidden-xs">Moderators</span></NavLink>
							<NavLink to="/manager"><Queen/> <span className="hidden-xs">Managers</span></NavLink>
							<NavLink to="/trainer/summary"><Education/> <span className="hidden-xs">Trainers</span></NavLink>
							{this.props.reportTab ? <NavLink to="/reports/profitablity"><Stats/> <span className="hidden-xs">Reports</span></NavLink> : null}
							<NavLink to="/analytics/project_cycle_wise"><Queen/> <span className="hidden-xs">Auditor Analytics</span></NavLink>
							<NavLink to="/training"><Pencil/> <span className="hidden-xs">Auditor Notes</span></NavLink>
							<NavLink to="/admindashboard"><File/> <span className="hidden-xs">Dashboard</span></NavLink>
						</ul>
						:
						<ul className="nav navbar-nav">
							<NavLink to="/client"><King/> <span className="hidden-xs">Clients</span></NavLink>
							<NavLink to="/auditor"><Pawn/> <span className="hidden-xs">Auditors</span></NavLink>
							{/* <NavLink to="/agency_user"><Rook/> <span className="hidden-xs">Agency</span></NavLink> */}
							{/* <NavLink to="/moderator/summary"><Knight/> <span className="hidden-xs">Moderators</span></NavLink> */}
						</ul>
					}
					<ul className="nav navbar-nav navbar-right">
						<li>
							<a>
								<Heartbeat/>
							</a>
						</li>
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
								<li>
									<a href="/country" target="_blank" rel="noopener noreferrer">
										<MapMarker/> Cities
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

