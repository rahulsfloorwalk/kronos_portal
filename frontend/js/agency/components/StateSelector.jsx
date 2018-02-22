import React from "react";
import PropTypes from "prop-types";
import { } from "react-redux";
import { } from "react-router";

import { } from "../../styles.js";

import { } from "../../components/Icons.jsx";
//import Loading from "../../components/Loading.jsx";

import { fetchStates } from "../service/city.js";

export default class StateSelector extends React.Component{
	static propTypes = {
		onChange: PropTypes.func,
	};

	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			states: {},
			selectedState: "",
		};
	}

	setLoading = (loading) => this.setState(prevState => Object.assign({}, prevState, { loading }));

	componentDidMount(){
		this.setLoading(true);
		fetchStates().then((states)=>this.setState({states})).finally(this.setLoading(false));
	}

	stateChanged = (e) => {
		this.props.onChange && this.props.onChange(e.target.value);
		this.setState({
			selectedState: e.target.value
		});
	};

	render(){
		let options = [];

		for( let key in this.state.states){
			options.push(<option key={key} value={key}>{this.state.states[key]}</option>);
		}

		return (
			<select className="form-control input-lg" value={this.state.selectedState} onChange={this.stateChanged}>
				<option value="">Select State</option>
				{options}
			</select>
		);
	}
}
