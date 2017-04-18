import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { ShareAlt, MapMarker } from '../Icons.jsx';
import { fetchStates, fetchCities } from '../../manager_actions.js'

var CityList = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchStates());
		this.props.dispatch(fetchCities(this.props.params.stateId));
	},
	render: function(){
		var rows = [];
		for(var c of this.props.cities) {
			var linkTo = `/state/${this.props.params.stateId}/city/${c.id}/location`;
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
					<Link to="/state">States</Link> / <b>{ this.props.stateName }</b> / City List
				</h2>
				{rows}
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		cities: store.cities,
		stateName: store.states[ownProps.params.stateId]
	};
};

export default ReactRedux.connect(mapStoreToProps)(CityList);
