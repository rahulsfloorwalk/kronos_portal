import React from "react";
import PropTypes from "prop-types";

import Gauge from "react-svg-gauge";

import { getColor, getRatingText } from "../../../utils";

const getGaugeProps = (colorCode) => {
	return {
		1: { // "danger";
			backgroundColor: "#F8F8F8",
			foregroudColor: "#FFC299",
		},
		2: { // "warning";
			backgroundColor: "#F8F8F8",
			foregroudColor: "#FFEB99",
		},
		3: { // "info";
			backgroundColor: "#F8F8F8",
			foregroudColor: "#FFFF99",
		},
		4: { // "success";
			backgroundColor: "#F8F8F8",
			foregroudColor: "#EAFF99",
		},
		5: {
			backgroundColor: "#F8F8F8",
			foregroudColor: "#C1FF99",
		},
	}[colorCode];
};

export default class OverallExperienceGauge extends React.Component {
	static propTypes = {
		colorCode: PropTypes.number.isRequired,
		value: PropTypes.number.isRequired,
	};

	render(){
		const tableCellStyle = {
			verticalAlign: "middle",
		};
		const { backgroundColor, foregroudColor } = getGaugeProps(this.props.colorCode);
		return (
			<div className={"panel panel-default"}>
				<div className="panel-heading">
					Overall Experience
				</div>
				<table className="table">
					<tbody>
						<tr>
							<td className="text-center" rowSpan={5}>
								<Gauge
									label=""
									value={this.props.value}
									width={500}
									height={300}
									min={0}
									max={100}
									color={foregroudColor}
									backgroundColor={backgroundColor}
									valueFormatter={v => v+"﹪"}
								/>
								<span style={{
									"position":"absolute",
									"bottom":"10%",
									"left":"37%",
									"fontSize": "1.6em",
									"fontWeight": "bold",
									"transform": "translateX(-50%)",
								}}>{getRatingText(this.props.colorCode)}</span>
							</td>
							<td className="text-right rating-excellent" style={tableCellStyle}><b>Excellent</b></td>
							<td className="rating-excellent" style={tableCellStyle}>90% and above</td>
						</tr>
						<tr className="rating-good">
							<td className="text-right" style={tableCellStyle}><b>Good</b></td>
							<td style={tableCellStyle}>85% - 89%</td>
						</tr>
						<tr className="rating-average">
							<td className="text-right" style={tableCellStyle}><b>Average</b></td>
							<td style={tableCellStyle}>75% - 84%</td>
						</tr>
						<tr className="rating-poor">
							<td className="text-right" style={tableCellStyle}><b>Poor</b></td>
							<td style={tableCellStyle}>66% - 74% </td>
						</tr>
						<tr className="rating-bad">
							<td className="text-right" style={tableCellStyle}><b>Bad</b></td>
							<td style={tableCellStyle}>0% - 65%</td>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}
}
