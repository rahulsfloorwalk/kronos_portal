import React, { Component } from "react";
import PropTypes from "prop-types";

import { } from "../../../components/Icons.jsx";

export default class ImpactFactorInput extends Component {
	static propTypes = {
		impactFactors: PropTypes.arrayOf(PropTypes.string),
		onChange: PropTypes.func.isRequired,
	};

	static defaultProps = {
		impactFactors: [],
	};

	static separator = ",";

	onChange = (e) => {
		this.props.onChange(
			e.target.value
				.split(ImpactFactorInput.separator)
				.map(s => s.trim())
		);
	};

	render(){
		const value = this.props.impactFactors.join(ImpactFactorInput.separator);
		return (
			<input
				className="form-control"
				placeholder="impact factors"
				type="text"
				name="sequence"
				value={value}
				onChange={this.onChange}
			/>
		);
	}
}
