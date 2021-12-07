import React from "react";

// import NotificationBox from "./NotificationBox.jsx";
import AuditCycleDashboard from "./AuditCycleDashboard.jsx";

class Dashboard extends React.Component {
	render() {
		return (
			<div>
				<div className="row">
					<div className="col-md-12">
						<AuditCycleDashboard />
						{/* <NotificationBox/> */}
					</div>
				</div>
			</div>
		);
	}
}

export default Dashboard;
