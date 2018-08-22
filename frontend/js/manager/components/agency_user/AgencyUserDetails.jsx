import React from "react";
import PropTypes from "prop-types";

import AgencyUserDetailsPanel from "./AgencyUserDetailsPanel.jsx";

export default class AgencyUserDetails extends React.Component{
	static propTypes = {
		params: PropTypes.shape({
			userId: PropTypes.string.isRequired,
		}),
	};
	constructor(props){
		super(props);
	}
	render(){
		return (
			<div className="row">
				<div className="col-md-6">
					<AgencyUserDetailsPanel userId={parseInt(this.props.params.userId)}/>
				</div>
				<div className="col-md-6">
				</div>
			</div>
		);
	}
}
