import React from "react";
import * as ReactRedux from "react-redux";
import PropTypes from "prop-types";
import NavLink from "../../components/NavLink.jsx";
import { Retweet, Home, Bishop, Th } from "../../components/Icons.jsx";

class ProjectDetails extends React.Component {
	static propTypes = {
		children: PropTypes.node,
		clientId: PropTypes.number,
	};
	render() {
		return (
			<div className="col-md-12">
				<ul className="nav nav-tabs">
					<NavLink to={`/projects/${this.props.clientId}/audit_cycle`}><Retweet/> Audit Cycles</NavLink>
					<NavLink to={`/projects/${this.props.clientId}/questionnaire_type`}><Th/> Questionnaire Types</NavLink>
					<NavLink to={`/projects/${this.props.clientId}/store`}><Home/> Stores</NavLink>
					<NavLink to={`/projects/${this.props.clientId}/client_user`}><Bishop/> Client Users</NavLink>
				</ul>
				{this.props.children}
			</div>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		clientId: store.client.id,
	};
};

export default ReactRedux.connect(mapStoreToProps)(ProjectDetails);