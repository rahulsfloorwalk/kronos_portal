import React, { Component } from "react";
import PropTypes from "prop-types";

import { } from "../../../components/Icons.jsx";

export default class ImpactFactorInput extends Component {
	static propTypes = {
		impactFactors: PropTypes.arrayOf(PropTypes.string),
		onChange: PropTypes.func.isRequired,
	};

	state = {
		inputState: "",
	};

	static defaultProps = {
		impactFactors: [],
	};

	static separator = ",";

	unparse = (tags) => tags.join(ImpactFactorInput.separator);
	parse = (input) => input.split(ImpactFactorInput.separator).map(s => s.trim());

	componentDidMount() {
		this.setState({
			inputState: this.unparse(this.props.impactFactors),
		});
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.impactFactors !== this.props.impactFactors) {
			this.setState({
				inputState: this.unparse(nextProps.impactFactors),
			});
		}
	}

	onChange = (e) => {
		this.setState({
			inputState: e.target.value,
		});
	};

	onBlur = () => {
		this.props.onChange(this.parse(this.state.inputState));
	};

	render(){
		return (
			<input
				className="form-control"
				placeholder="impact factors"
				type="text"
				name="sequence"
				value={this.state.inputState}
				onChange={this.onChange}
				onBlur={this.onBlur}
			/>
		);
	}
}
