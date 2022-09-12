import React, { Component } from "react";
import PropTypes from "prop-types";

export default class StarRating extends Component{
	static propTypes = {
		rating: PropTypes.number,
	};
	static defaultProps = {
		rating: 0,
	};
	render(){
		let ratings = [];
		let count = 1;
		for(let i = 1; i <= this.props.rating; i++){
			ratings.push(<label key={count} style={{color: "#f90"}}>&#9733;</label>);
			count += 1;
		}
		for(let i = 1; i <= (5 - this.props.rating); i++){
			ratings.push(<label key={count} style={{color: "#ccc"}}>&#9733;</label>);
			count += 1;
		}
		return(
			<span>
				{ratings}
			</span>
		);
	}
}