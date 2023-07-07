import React from "react";
import PropTypes from "prop-types";
import { File} from "../../../components/Icons.jsx";
import SideDashboard from "./SideDashboard.jsx";
import DashboardContainer from "./DashboardContainer.jsx";


export default class AdminDashboard extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};
	state ={
		openSidebar : true,
	};

	handleSidebar = () =>{
		this.setState(prevState => ({
			openSidebar: !prevState.openSidebar
		}));
	};
	render() {

		return (
			<div >
				<h2 className="page-header">
					<span onClick={this.handleSidebar}><File /></span> DashBoard
				</h2>

				<div className="d-flex" style={{position:"relative"}}>
					{this.state.openSidebar &&
					<div className="col-md-2" style={{borderRight:"1px solid #eee",}}
					>
						<SideDashboard/>
					</div>
					}
					<div className="col-md-10">
						{this.props.children ? this.props.children : <DashboardContainer/>}
					</div>
				</div>
			</div>
		);
	}
}
