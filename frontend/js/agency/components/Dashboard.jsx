import React from "react";

import AgencyDetailsPanel from "./AgencyDetailsPanel.jsx";
import UserDetailsPanel from "./UserDetailsPanel.jsx";
import PresencePanel from "./PresencePanel.jsx";

const Dashboard = () => {
	return (
		<div>
			<div className="row">
				<div className="col-md-6">
					<AgencyDetailsPanel/>
				</div>
				<div className="col-md-6">
					<UserDetailsPanel/>
				</div>
			</div>
			<PresencePanel/>
		</div>
	);
};

export default Dashboard;
