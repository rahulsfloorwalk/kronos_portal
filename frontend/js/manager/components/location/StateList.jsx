import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { truncateStyle } from '../../../styles.js';

import { fetchStates } from '../../service/location.js';

import { MapMarker } from '../../../components/Icons.jsx';
import Loading from '../../../components/Loading.jsx';

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
		for(let stateId in this.state.states) {
			let linkTo = `state/${stateId}`;
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
				<div className="col-md-3">
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
	},
});

