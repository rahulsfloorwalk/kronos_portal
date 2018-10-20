import React from "react";
import PropTypes from "prop-types";

import Gauge from "react-svg-gauge";

import { getColor } from "../../../utils";

const getGaugeProps = (colorCode) => {
	return {
		1: { // "danger";
			backgroundColor: "#F2DEDE",
			foregroudColor: "#D9534F",
		},
		2: { // "warning";
			backgroundColor: "#FCF8E3",
			foregroudColor: "#F0AD4E",
		},
		3: { // "info";
			backgroundColor: "#D9EDF7",
			foregroudColor: "#5BC0DE",
		},
		4: { // "success";
			backgroundColor: "#DFF0D8",
			foregroudColor: "#5CB85C",
		},
	}[colorCode];
};

export default class OverallExperienceGauge extends React.Component {
	static propTypes = {
		colorCode: PropTypes.number.isRequired,
		value: PropTypes.number.isRequired,
	};

	render(){
		const { backgroundColor, foregroudColor } = getGaugeProps(this.props.colorCode);
		return (
			<div className={"panel panel-" + getColor(this.props.colorCode)}>
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
						color={foregroudColor}
						backgroundColor={backgroundColor}
						valueFormatter={v => v+"﹪"}
					/>
				</div>
			</div>
		);
	}
}
