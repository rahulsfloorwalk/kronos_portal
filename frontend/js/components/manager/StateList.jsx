import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchStates } from '../../manager_actions.js';

import { MapMarker } from '../Icons.jsx';

var StateList = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchStates());
	},
	render: function(){
		console.debug("PROPS",this.props);
		var rows = [];
		for(var stateId in this.props.states) {
			var linkTo = `state/${stateId}/city`;
			rows.push(
				<div key={stateId} className="col-md-3">
					<div className="panel panel-default">
						<div className="panel-body">
							<h4>{this.props.states[stateId]}</h4>
							<Link to={linkTo} className="btn btn-default">View</Link>
						</div>
					</div>
				</div>
			);
		}
		return (
			<div>
				<h2 className="page-header">
					<MapMarker/> States
				</h2>
				<div className="row">
					{rows}
				</div>
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		states: store.states
	};
};

export default ReactRedux.connect(mapStoreToProps)(StateList); 
