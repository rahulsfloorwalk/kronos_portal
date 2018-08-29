import React from "react";
import PropTypes from "prop-types";

import { AuditStoreRatings } from "../constants.js";

export default class AuditStoreRating extends React.Component {
	static propTypes = {
		rating: PropTypes.oneOf(AuditStoreRatings),
	};

	render() {
		switch(this.props.rating){
		case 0:
			return <strong className="text-danger">Bad</strong>;
		case 1:
			return <strong className="text-warning">Average</strong>;
		case 2:
			return <strong className="text-success">Good</strong>;
		case null:
			return <span>not rated</span>;
		default:
			return <strong>unknown rating</strong>;
		}
	}
}
