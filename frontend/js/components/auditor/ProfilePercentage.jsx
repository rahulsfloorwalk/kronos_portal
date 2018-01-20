import React from "react";
import { Link } from "react-router";

import ProgressBar from "../ProgressBar.jsx";

import { getProfileCompletionPercentage } from "../../auditor/service/dashboard.js";

export default class ProfilePercentage extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			percentage: 0,
		};
	}

	componentDidMount(){
		getProfileCompletionPercentage().then((percentage) => {
			this.setState({percentage});
		});
	}

	componentWillReceiveProps(){
		getProfileCompletionPercentage().then((percentage) => {
			this.setState({percentage});
		});
	}

	render(){
		let message;
		/*
		if( this.state.percentage === 100){
			message = <h3>Congratulations, your Profile is complete.</h3>;
		} else if( this.state.percentage >= 50){
			message = <h3>You can now <Link to="/audit">apply to audits.</Link></h3>;
		} else if( this.state.percentage >= 25){
			message = <h3>You can now <Link to="/audit">view audits.</Link></h3>;
		}*/

		return (<div>
			{message}
			<ProgressBar type="success" striped={true} percentage={this.state.percentage}/>
		</div>);
	}
}
