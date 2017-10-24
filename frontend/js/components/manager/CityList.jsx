import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Loading from '../Loading.jsx';
import { ShareAlt, MapMarker } from '../Icons.jsx';
import { fetchStates, fetchCities } from '../../manager/service/location.js'

export default React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		fetchStates().done((states) => this.setState({states}));
		fetchCities(this.props.params.stateId).done((cities) => this.setState({cities}));
	},
	render: function(){
		if( ! this.state.states || !this.state.cities){
			return <Loading/>;
		}
		let rows = [];
		let stateName = this.state.states[this.props.params.stateId];
		for(let c of this.state.cities) {
			let linkTo = `/state/${this.props.params.stateId}/city/${c.id}/location`;
			rows.push(
				<div key={c.id} className="col-md-3">
					<div className="panel panel-default">
						<div className="panel-body">
							<a href={c.gmaps_url} className="btn btn-link pull-right" target="_blank">
								<MapMarker/>
							</a>
							<h4>{c.name}</h4>
							<Link to={linkTo} className="btn btn-default">
								<ShareAlt/>
								View
							</Link>
						</div>
					</div>
				</div>
			);
		}
		return (
			<div>
				<h2 className="page-header">
					<Link to="/state">States</Link> / <b>{ stateName }</b> / City List
				</h2>
				{rows}
				{this.props.children}
			</div>
		);
	},
});
