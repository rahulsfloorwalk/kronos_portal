import React from "react";
import PropTypes from "prop-types";

import { AuditorRatings } from "../constants.js";

export default class AuditorRating extends React.Component {
	static propTypes = {
		rating: PropTypes.oneOf(AuditorRatings),
	};

	render() {
		switch(this.props.rating){
		case "W":
			return <strong className="text-danger">Worse</strong>;
		case "A":
			return <strong className="text-warning">Average</strong>;
		case "G":
			return <strong className="text-info">Good</strong>;
		case "E":
			return <strong className="text-success">Excellent</strong>;
		case null:
			return <span>not rated</span>;
		default:
			return <strong>unknown rating</strong>;
		}
	}
}
