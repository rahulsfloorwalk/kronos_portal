import React from "react";

// import NotificationBox from "./NotificationBox.jsx";
import AuditCycleDashboard from "./AuditCycleDashboard.jsx";
import PMPlanningDashboard from "./PMPlanningDashboard.jsx";
import QAPlanningDashboard from "./QAPlanningDashboard.jsx";

class Dashboard extends React.Component {
	render() {
		return (
			<div>
				<div className="row">
					<div className="col-md-12">
						<AuditCycleDashboard />
						{/* <NotificationBox/> */}
						<PMPlanningDashboard />
						<QAPlanningDashboard/>
					</div>
				</div>
			</div>
		);
	}
}

export default Dashboard;
