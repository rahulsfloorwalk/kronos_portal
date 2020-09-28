import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { fetchCountries } from "../../service/location.js";

import { MapMarker } from "../../../components/Icons.jsx";
import Loading from "../../../components/Loading.jsx";

export default class CountryList extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			countryId: PropTypes.string,
		}),
		children: PropTypes.node,
	};

	state = {};

	componentDidMount() {
		fetchCountries().done((countries) => this.setState({countries}));
	}

	render() {
		if(! this.state.countries){
			return <Loading/>;
		}
		let rows = [];
		let countries_list = this.state.countries;
		for(let countryId in countries_list) {
			let linkTo = `country/${countryId}/state`;
			let activeClass = this.props.params.countryId === countryId ? "active" : "";
			rows.push(
				<Link key={countryId} to={linkTo} className={"list-group-item " + activeClass}>
					{countries_list[countryId]}
				</Link>
			);
		}
		return (
			<div>
				<div className="row">
					<div className="col-md-3">
						<h2 className="page-header">
							<MapMarker/> Countries
						</h2>
						<div className="list-group">
							{rows}
						</div>
					</div>
					<div className="col-md-9">
						{this.props.children}
					</div>
				</div>
			</div>
		);
	}
}
