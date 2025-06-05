import React from "react";
import { hashHistory } from "react-router";

import { pointerStyle } from "../../styles.js";

import { Hourglass, Checked } from "../../components/Icons.jsx";
import NavLink from "../../components/NavLink.jsx";

import { logout } from "../service/auth.js";

import floorwalkHeaderLogoUrl from "../../../img/logo_500x268.png";
import { logoutTimer } from "../service/audit_store.js";

export default class Header extends React.Component {
	getTimerData = () => {
		const timerData = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key.startsWith("timer_")) {
				const audit_store_id = key.split("_")[1];
				const totalTime = localStorage.getItem(key);
				if (totalTime) {
					const seconds = parseInt(totalTime, 10);
					const hrs = Math.floor(seconds / 3600);
					const mins = Math.floor((seconds % 3600) / 60);
					const secs = seconds % 60;
					timerData.push({
						audit_store_id,
						moderator_submission_time: `${hrs}:${mins}:${secs}`,
					});
				}
			}
		}
		return timerData;
	};

	performLogout = () => {
		const timerData = this.getTimerData();
		if (!timerData || timerData.length === 0) {
			logout().then(() => {
				localStorage.clear();
				hashHistory.push("/login?logout=true");
			});
			return;
		}
		logoutTimer(timerData).then(() => {
			logout().then(() => {
				localStorage.clear();
				hashHistory.push("/login?logout=true");
			});
		});
	};

	render() {
		let brandStyle = {
			height: "40px",
			transform: "translateY(-25%)",
		};
		return (
			<nav className="navbar navbar-default navbar-static-top">
				<div className="container">
					<div className="navbar-header">
						<a className="navbar-brand">
							<img className="img-responsive" style={brandStyle} alt="FloorWalk" title="FloorWalk" src={floorwalkHeaderLogoUrl} />
						</a>
					</div>
					<ul className="nav navbar-nav">
						<NavLink to="/?type=qa_pending"><Hourglass /> QA Pending</NavLink>
						<NavLink to="/?type=qa_done"><Checked /> QA Complete</NavLink>
					</ul>
					<ul className="nav navbar-nav navbar-right">
						<li>
							<a style={pointerStyle} onClick={this.performLogout}>Logout</a>
						</li>
					</ul>
				</div>
			</nav>
		);
	}
}

