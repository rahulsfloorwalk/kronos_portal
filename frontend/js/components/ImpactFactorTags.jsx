import React, { Component } from "react";
import PropTypes from "prop-types";

import Badge from "./Badge.jsx";

export default class ImpactFactorTags extends Component {
	static propTypes = {
		impactFactors: PropTypes.arrayOf(PropTypes.string).isRequired,
	};

	static defaultProps = {
		impactFactors: [],
	};

	render(){
		return (<div>
			{this.props.impactFactors.map((factor, i) => <span key={i}><Badge>{factor}</Badge>&nbsp;</span>)}
		</div>);
	}
}
