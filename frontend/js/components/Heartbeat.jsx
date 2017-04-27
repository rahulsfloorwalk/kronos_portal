import React from 'react';

import { Alert } from './Icons.jsx';

import { lubdub } from '../manager/service/heartbeat.js';

export default React.createClass({
	getInitialState: function(){
		return {
			alive: true,
			intervalId: null
		};
	},
	check: function(){
		lubdub().then(()=>{
			this.setState({
				alive: true
			});
		}, () => {
			this.setState({
				alive: false
			});
		});
	},
	componentDidMount: function(){
		this.setState({
			intervalId: setInterval( this.check, 5000)
		});
	},
	componentWillUnmount: function(){
		clearInterval(this.state.intervalId);
	},
	render : function(){
		if( ! this.state.alive){
			return (
				<span className="label label-warning">
					<Alert/> No Connection
				</span>
			);
		} else {
			return null;
		}
	},
});

