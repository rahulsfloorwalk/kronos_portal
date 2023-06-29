import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { Check, Cross, Education, Pencil, Plus, File,Retweet,Dashboard,ArrowRight } from "../../../components/Icons.jsx";

import { findTrainers } from "../../service/trainer.js";
import NavLink from "../../../components/NavLink.jsx";
import SideDashboard from "./SideDashboard.jsx";
import DashboardContainer from "./DashboardContainer.jsx";


export default class AdminDashboard extends React.Component {
	state ={
		openSidebar : true,
	}
	

	handleSidebar = () =>{
		this.setState(prevState => ({
			openSidebar: !prevState.openSidebar
		  }));
	}
	render() {

		return (
			<div >
				<h2 className="page-header">
				<span onClick={this.handleSidebar}><File /></span> 
				  DashBoard
				</h2>
				
				<div className="d-flex" style={{position:"relative"}}>
					{this.state.openSidebar &&
					<div className="col-md-2" 
					style={{borderRight:"1px solid #eee",
				}}
					>
						<SideDashboard/>
					</div>
				}
					<div className="col-md-10" 
					>
					{this.props.children ? this.props.children : <DashboardContainer/>}
					</div>
				</div>
			</div>
		);
	}
}
