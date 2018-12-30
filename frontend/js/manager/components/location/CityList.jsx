import React from "react";
import PropTypes from "prop-types";

import Loading from "../../../components/Loading.jsx";
import { MapMarker } from "../../../components/Icons.jsx";
import { fetchStates, fetchCities } from "../../service/location.js";

export default class CityList extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			stateId: PropTypes.string.isRequired,
		}),
		children: PropTypes.node,
	};
	state = {};

	componentDidMount() {
		fetchStates().done((states) => this.setState({states}));
		fetchCities(this.props.params.stateId).done((cities) => this.setState({cities}));
	}

	componentWillReceiveProps(nextProps) {
		if(this.props.params.stateId !== nextProps.params.stateId){
			fetchCities(nextProps.params.stateId).done((cities) => this.setState({cities}));
		}
	}

	render() {
		if( ! this.state.states || !this.state.cities){
			return <Loading/>;
		}
		let rows = [];
		let stateName = this.state.states[this.props.params.stateId];
		for(let c of this.state.cities) {
			rows.push(
				<div key={c.id} className="list-group-item">
					<a href={c.gmaps_url} className="btn btn-sm btn-default " target="_blank">
						<MapMarker/>
					</a>
					&nbsp;
					{c.name}
				</div>
			);
		}
		return (
			<div>
				<h2 className="page-header">
					<b>{ stateName }</b>
				</h2>
				<div className="list-group">
					{rows}
				</div>
				{this.props.children}
			</div>
		);
	}
}
