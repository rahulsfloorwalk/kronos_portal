import React from "react";

import ProgressBar from "../../components/ProgressBar.jsx";

import { getProfileCompletionPercentage } from "../service/dashboard.js";

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

		return (<div style={{ display: "flex"}}>
			{message}
			<div style={{width:"40px", fontWeight:"bold"}}>
				<span>{this.state.percentage}%</span>
			</div>
			<div style={{ width: "100%" }}>
				<ProgressBar type="success" striped={true} percentage={this.state.percentage}/>
			</div>
		</div>);
	}
}
