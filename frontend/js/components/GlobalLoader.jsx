import React, { Component } from "react";
import PropTypes from "prop-types";
import Loading from "../components/Loading.jsx";

export default class GlobalLoader extends Component {
	static propTypes = {
		show: PropTypes.bool.isRequired,
		text: PropTypes.string
	};

	componentDidUpdate(prevProps) {
		if (this.props.show && !prevProps.show) {
			document.body.style.overflow = "hidden";
		}

		if (!this.props.show && prevProps.show) {
			document.body.style.overflow = "auto";
		}
	}

	componentWillUnmount() {
		document.body.style.overflow = "auto";
	}

	render() {
		const { show, text = "Processing..." } = this.props;

		if (!show) return null;

		const overlayStyle = {
			position: "fixed",
			top: 0,
			left: 0,
			width: "100vw",
			height: "100vh",
			background: "rgba(0, 0, 0, 0.5)",
			zIndex: 999999,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			pointerEvents: "all"
		};

		const boxStyle = {
			textAlign: "center",
			color: "white",
			fontSize: "16px"
		};

		return (
			<div style={overlayStyle}>
				<div style={boxStyle}>
					<div className="spinner-border text-light" />
					<Loading />
					<div style={{ marginTop: "10px" }}>{text}</div>
				</div>
			</div>
		);
	}
}
