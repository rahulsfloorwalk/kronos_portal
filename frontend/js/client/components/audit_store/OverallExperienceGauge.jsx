import React from "react";
import PropTypes from "prop-types";

import Gauge from "react-svg-gauge";

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
		const gaugeProps = getGaugeProps(this.props.color);
		return (
			<div className={"panel panel-" + getColor(this.props.color)}>
				<div className="panel-heading">
					Overall Experience
				</div>
				<div className="panel-body text-center">
					<Gauge
						value={this.props.value}
						width={500}
						height={300}
						min={0}
						max={100}
						label=""
						color={gaugeProps.progressColor}
						backgroundColor={gaugeProps.dialColor}
						valueFormatter={v => v+"﹪"}
					/>
				</div>
			</div>
		);
	}
}
