import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import dpUrl from "../../../img/dp.png";

export default class ProfileCard extends React.Component {
	static propTypes = {
		firstName: PropTypes.string,
		lastName: PropTypes.string,
		city: PropTypes.string,
		phone: PropTypes.string,
	};
	render() {
		return (
			<div className=" text-center">
				<img src={dpUrl} alt="profile pic" className="img-circle" width="100" height="100" />
				<h2>{this.props.firstName} {this.props.lastName}</h2>
				<h4>{this.props.city}&emsp;&emsp;&emsp;{ this.props.phone ? this.props.phone : <Link className="text-danger" to="/details/mobile_number/edit"><b>Update Mobile Number</b></Link>}</h4>
			</div>
		);
	}
}
