import React from "react";
import PropTypes from "prop-types";


const CircularDial = (props) => {
	return (
		<circle
			cx={props.cX}
			cy={props.cY}
			r={props.radius}
			fill="none"
			stroke={props.dialColor}
			strokeWidth={props.dialWidth}
		>
		</circle>
	);
};

CircularDial.propTypes = {
	cX: PropTypes.number.isRequired,
	cY: PropTypes.number.isRequired,
	radius: PropTypes.number.isRequired,
	dialColor: PropTypes.string.isRequired,
	dialWidth: PropTypes.number.isRequired,
};

const Needle = (props) => {
	const
		x1 = props.cX,
		y1 = props.cY - (props.needleWidth / 2),
		x2 = props.cX,
		y2 = props.cY + (props.needleWidth / 2),
		x3 = props.diameter,
		y3 = props.cY,
		needleAngle = (360 * props.currentValue) / 100;

	let needleElm = null;
	if (props.needleSharp) {
		needleElm = (
			<polygon
				points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
				fill={props.needleColor}
			>

			</polygon>
		);
	} else {
		needleElm = (
			<line
				x1={props.cX}
				y1={props.cY}
				x2={props.diameter}
				y2={props.cY}
				fill="none"
				strokeWidth={props.needleWidth}
				stroke={props.needleColor}
			/>
		);
	}

	return (
		<g className="needle">
			<circle
				cx={props.cX}
				cy={props.cY}
				r={props.needleBaseSize}
				fill={props.needleBaseColor}
			>
			</circle>
			<g transform={`rotate(${needleAngle} ${props.cX} ${props.cY})`}>
				{needleElm}
			</g>
		</g>
	);

};

Needle.propTypes = {
	cX: PropTypes.number.isRequired,
	cY: PropTypes.number.isRequired,
	diameter: PropTypes.number.isRequired,

	needleWidth: PropTypes.number.isRequired,
	needleSharp: PropTypes.bool,
	needleColor: PropTypes.string.isRequired,

	needleBaseSize: PropTypes.number.isRequired,
	needleBaseColor: PropTypes.string.isRequired,

	currentValue: PropTypes.number.isRequired,
};

export default class Gauge extends React.Component {
	static propTypes = {
		label: PropTypes.string,
		size: PropTypes.number,
		className: PropTypes.string,
		semiCircle: PropTypes.bool,

		//dial
		dialWidth: PropTypes.number,
		dialColor: PropTypes.string,

		//tick
		tickLength: PropTypes.number,
		tickWidth: PropTypes.number,
		tickColor: PropTypes.string,
		tickInterval: PropTypes.number,

		//needle
		needleWidth: PropTypes.number,
		needleSharp: PropTypes.bool,
		needleColor: PropTypes.string,

		//needleBase
		needleBaseSize: PropTypes.number,
		needleBaseColor: PropTypes.string,

		//progressBar
		progressWidth: PropTypes.number,
		progressColor: PropTypes.string,
		progressRoundedEdge: PropTypes.bool,

	};

	static defaultProps = {
		size: 200,

		dialWidth: 10,
		dialColor: "#eee",

		tickLength: 3,
		tickWidth: 1,
		tickColor: "#cacaca",
		tickInterval: 10,

		maximumValue: 100,
		currentValue: 25,

		progressWidth: 5,
		progressColor: "#3d3d3d",
		progressRoundedEdge: true,

		downProgressColor: "red",

		progressFont: "Serif",
		progressFontSize: "40",

		needleBaseSize: 5,
		needleBaseColor: "#9d9d9d",

		needleWidth: 2,
		needleSharp: false,
		needleColor: "#8a8a8a",

		semiCircle: false,
	};


	defineTick = (opts, tickId) => {
		const tX1 = opts.cX + opts.radius - (Math.max(opts.dialWidth, opts.progressWidth) / 2);
		const tX2 = tX1 - opts.tickLength;

		return (<line
			id={tickId}
			x1={tX1}
			y1={opts.cY}
			x2={tX2}
			y2={opts.cY}
			stroke={opts.tickColor}
			strokeWidth={opts.tickWidth}
		/>);
	};

	renderTicks = (opts, tickId) => {
		const tickAngles = [];
		for (let i = 0; i <= 360; i += opts.tickInterval) {
			tickAngles.push(i);
		}
		return (
			<g className="ticks">
				{
					tickAngles.map((tickAngle, idx) => {
						return <use
							href={`#${tickId}`}
							key={`tick-${idx}`}
							transform={`rotate(${tickAngle} ${opts.cX} ${opts.cY})`}
						/>;
					})
				}
			</g>
		);
	};

	renderProgress = (opts) => {

		const offset = (opts.circumference * (1 - (opts.currentValue / 100)));

		return (
			<circle
				cx={opts.cX}
				cy={opts.cY}
				r={opts.radius}
				fill="none"
				stroke={opts.progressColor}
				strokeWidth={opts.progressWidth}
				strokeDasharray={opts.circumference}
				strokeDashoffset={offset}
				strokeLinecap={opts.progressRoundedEdge ? "round" : "butt"}
			/>
		);
	};


	renderText = (opts) => {
		return (
			<text
				x={opts.cX}
				y={opts.cY + 55}
				fontFamily={opts.progressFont}
				fontSize={opts.progressFontSize}
				transform={`rotate(90 ${opts.cX} ${opts.cY})`}
				textAnchor="middle"
				fill={opts.progressColor}
			>
				{opts.label}
			</text>
		);
	};

	render() {
		const TICK_ID = "tick";
		const {
			size,
			dialWidth,
		} = this.props;

		const cX = size / 2;
		const cY = size / 2;
		const radius = (size - (2 * dialWidth)) / 2;
		const diameter = 2 * radius;
		const circumference = 2 * Math.PI * radius;

		const opts = Object.assign({}, this.props, {
			cX,
			cY,
			radius,
			diameter,
			circumference,
		});

		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className={opts.className}
				height={size}
				width={size}
				viewBox={`0 0 ${size} ${size}`}>
				<defs>
					{this.defineTick(opts, TICK_ID)}
				</defs>
				<g transform={`rotate(-90 ${cX} ${cY})`}>
					<CircularDial {...opts}/>
					{this.renderTicks(opts, TICK_ID)}
					{this.renderProgress(opts)}
					<Needle {...opts}/>
					{this.renderText(opts)}
				</g>
			</svg>
		);
	}
}

