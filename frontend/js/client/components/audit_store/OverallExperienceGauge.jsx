import React from "react";
import PropTypes from "prop-types";

import Gauge from "../../../components/Gauge.jsx";

import { getColor } from "../../../utils";

const getGaugeProps = (colorCode) => {
	switch(colorCode){
	case "1":
	case 1:
		// "danger";
		return {
			tickColor: "#D9534F",
			dialColor: "#F2DEDE",
			progressColor: "#D9534F",
		};
	case "2":
	case 2:
		// "warning";
		return {
			tickColor: "#F0AD4E",
			dialColor: "#FCF8E3",
			progressColor: "#F0AD4E",
		};
	case "3":
	case 3:
		// "info";
		return {
			tickColor: "#5BC0DE",
			dialColor: "#D9EDF7",
			progressColor: "#5BC0DE",
		};
	case "4":
	case 4:
		// "success";
		return {
			tickColor: "#5CB85C",
			dialColor: "#DFF0D8",
			progressColor: "#5CB85C",
		};
	case "":
	case null:
	case undefined:
		return "";
	default:
		return "";
	}
};

export default class OverallExperienceGauge extends React.Component {
	static propTypes = {
		color: PropTypes.number.isRequired,
		value: PropTypes.number.isRequired,
	};

	render(){
		return (
			<div className={"panel panel-" + getColor(this.props.color)}>
				<div className="panel-heading">
					Overall Experience
				</div>
				<div className="panel-body text-center">
					<Gauge
						label={this.props.value + "%"}
						currentValue={this.props.value}
						size={300}

						tickLength={10}
						tickWidth={2}
						tickColor="#3498DB"
						tickInterval={36}

						dialColor="#D1E8EE"
						dialWidth={10}

						needle={false}
						needleSharp={false}
						needleWidth={4}
						needleColor="#D3191A"

						needleBaseSize={8}
						//needleBaseColor="#078BC4"
						needleBaseColor="#D3191A"

						progressColor="#3498DB"
						progressWidth={12}
						progressRoundedEdge={true}
						progressFont="sans-serif"

						{...getGaugeProps(this.props.color)}
					/>
				</div>
			</div>
		);
	}
}
