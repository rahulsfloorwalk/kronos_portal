import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { truncateStyle } from '../../styles.js';

import { fetchStates } from '../../manager/service/location.js';

import { MapMarker } from '../Icons.jsx';
import Loading from '../Loading.jsx';

export default React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		fetchStates().done((states) => this.setState({states}));
	},
	render: function(){
		if(! this.state.states){
			return <Loading/>;
		}
		let rows = [];
		for(var stateId in this.state.states) {
			let linkTo = `state/${stateId}/city`;
			rows.push(
				<div key={stateId} className="col-md-3">
					<div className="panel panel-default">
						<div className="panel-body">
							<h4 style={truncateStyle}>{this.state.states[stateId]}</h4>
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

