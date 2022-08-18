import React from "react";
import PropTypes from "prop-types";

import { AuditorRatings } from "../constants.js";

export default class AuditorRating extends React.Component {
	static propTypes = {
		rating: PropTypes.oneOf(AuditorRatings),
	};

	render() {
		switch(this.props.rating){
		case 1:
			return <strong className="text-danger">Worse</strong>;
		case 2:
			return <strong className="text-warning">Average</strong>;
		case 3:
			return <strong className="text-info">Good</strong>;
		case 4:
			return <strong className="text-success">Excellent</strong>;
		case null:
			return <span>not rated</span>;
		default:
			return <strong>unknown rating</strong>;
		}
	}
}
