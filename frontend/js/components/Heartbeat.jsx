import React from "react";

import { Alert } from "./Icons.jsx";

import { lubdub } from "../manager/service/heartbeat.js";

export default class Heartbeat extends React.Component {
	state = {
		alive: true,
		intervalId: null
	};

	check = () => {
		lubdub().then(()=>{
			this.setState({
				alive: true
			});
		}, () => {
			this.setState({
				alive: false
			});
		});
	};

	componentDidMount() {
		this.setState({
			intervalId: setInterval( this.check, 5000)
		});
	}

	componentWillUnmount() {
		clearInterval(this.state.intervalId);
	}

	render() {
		if( ! this.state.alive){
			return (
				<span className="label label-warning">
					<Alert/> No Connection
				</span>
			);
		} else {
			return null;
		}
	}
}

