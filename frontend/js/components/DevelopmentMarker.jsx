import React, { Component } from 'react';
import { Link } from 'react-router';

export default class DevelopmentMarker extends Component{
	constructor(props){
		super(props);
	}
	render(){
		let c = ["#E08E45","#F8F4A6"];
		let texture = {
			background: `repeating-linear-gradient( 45deg, ${c[0]}, ${c[0]} 10px, ${c[1]} 10px, ${c[1]} 20px)`,
			marginBottom: "0px",
		};
		let blackText = {
			color: "black",
		};
		if(process.env.NODE_ENV === "development"){
			return (
				<nav className="navbar navbar-default navbar-static-top" style={texture}>
					<div className="container">
						<ul className="nav navbar-nav">
							<li><a><b>DEVELOPMENT IN PROGRESS</b></a></li>
						</ul>
						<ul className="nav navbar-nav navbar-right">
							<li><a><b>DEVELOPMENT IN PROGRESS</b></a></li>
						</ul>
					</div>
				</nav>
			);
		} else {
			return null;
		}
	}
}
