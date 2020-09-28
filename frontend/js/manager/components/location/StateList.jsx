import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { fetchStatesByCountry, fetchCountries } from "../../service/location.js";

import { MapMarker } from "../../../components/Icons.jsx";
import Loading from "../../../components/Loading.jsx";

export default class StateList extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			stateId: PropTypes.string,
			countryId: PropTypes.string,
		}),
		children: PropTypes.node,
	};

	state = {};

	componentDidMount() {
		fetchCountries().done((countries) => this.setState({countries}));
		fetchStatesByCountry(this.props.params.countryId).done((states) => this.setState({states}));
	}

	componentWillReceiveProps(nextProps) {
		if(this.props.params.countryId !== nextProps.params.countryId){
			fetchStatesByCountry(nextProps.params.countryId).done((states) => this.setState({states}));
		}
	}

	render() {
		if(! this.state.states){
			return <Loading/>;
		}
		let rows = [];
		for(let stateId in this.state.states) {
			let linkTo = `country/${this.props.params.countryId}/state/${stateId}/city`;
			let activeClass = this.props.params.stateId === stateId ? "active" : "";
			rows.push(
				<Link key={stateId} to={linkTo} className={"list-group-item " + activeClass}>
					{this.state.states[stateId]}
				</Link>
			);
		}
		return (
			<div>
				<div className="row">
					<div className="col-md-6">
						<h2 className="page-header">
							<MapMarker/> States
						</h2>
						<div className="list-group">
							{rows}
						</div>
					</div>
					<div className="col-md-6">
						{this.props.children}
					</div>
				</div>
			</div>
		);
	}
}
