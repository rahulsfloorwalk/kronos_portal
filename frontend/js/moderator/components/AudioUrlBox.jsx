import React, { Component } from "react";
import PropTypes from "prop-types";
import attachmentMicrophoneImgUrl from "../../../img/microphone_100.png";
import { audioToTextTranscription } from "../service/section";
import AudioPreview from "./AudioPreview.jsx";
import Alert from "react-s-alert";

export default class AudioUrlBox extends Component {
	static propTypes = {
		attachment: PropTypes.shape({
			id: PropTypes.number.isRequired,
			proof_type: PropTypes.string.isRequired,
			file_name: PropTypes.string,
			direct_url: PropTypes.string,
			file_slug: PropTypes.string,
			audio_to_text_row: PropTypes.object
		}),
		onReload: PropTypes.func,
		isAnyTranscribing: PropTypes.bool,
		setGlobalTranscribing: PropTypes.func
	};

	constructor(props) {
		super(props);
		this.state = {
			display: "none",
			transcribing: false
		};
	}

	showModal = () => {
		this.setState({ display: "block" });
	};

	hideModal = () => {
		this.setState({ display: "none" });
	};

	handleTranscribe = (e) => {
		e.stopPropagation();

		const { attachment, onReload, setGlobalTranscribing } = this.props;

		const payload = {
			audio_url: attachment.direct_url,
			attachment_id: attachment.id,
			force: true
		};

		this.setState({ transcribing: true });
		setGlobalTranscribing(true);

		audioToTextTranscription(payload)
			.then(() => {
				this.setState({ transcribing: false });
				setGlobalTranscribing(false);

				if (onReload) onReload();
			})
			.catch(() => {
				this.setState({ transcribing: false });
				setGlobalTranscribing(false);
				Alert.error("Failed to start transcription");
			});
	};
	render() {
		const { attachment } = this.props;

		const hasText =
			attachment.audio_to_text_row &&
			Object.keys(attachment.audio_to_text_row).length > 0;

		const boxStyle = {
			display: "inline-block",
			width: "150px",
			height: "100px",
			backgroundImage: `url(${attachmentMicrophoneImgUrl})`,
			backgroundSize: "30px 30px",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat",
			border: "1px solid LightGray",
			borderRadius: "4px",
			margin: "5px",
			position: "relative",
			cursor: "pointer"
		};

		const fileNameStyle = {
			position: "absolute",
			bottom: "0",
			width: "100%",
			background: "rgba(255,255,255,0.85)",
			fontSize: "12px",
			padding: "3px 5px",
			whiteSpace: "nowrap",
			overflow: "hidden",
			textOverflow: "ellipsis",
			pointerEvents: "none"
		};

		const indicatorStyle = {
			position: "absolute",
			top: "5px",
			right: "5px",
			fontSize: "18px"
		};

		const modalStyle = {
			display: this.state.display,
			overflow: "scroll"
		};

		const modalBackdropStyle = {
			zIndex: "1060",
			height: "100%"
		};

		const modalDialogStyle = {
			zIndex: "1070",
			width: "80%",
			maxWidth: "1000px"
		};

		return (
			<div style={{ display: "inline-block" }}>
				<div style={boxStyle} onClick={this.showModal}>
					<div style={indicatorStyle}>
						{hasText ? "✅" : "⚠️"}
					</div>
					{!hasText && (
						<div
							style={{
								position: "absolute",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)"
							}}
						>
							<button
								className="btn btn-xs btn-primary"
								onClick={this.handleTranscribe}
								disabled={this.state.transcribing || this.props.isAnyTranscribing}
								title={
									this.props.isAnyTranscribing && !this.state.transcribing
										? "Another transcription is in progress. Please wait..."
										: ""
								}
								style={{
									padding: "6px 12px",
									borderRadius: "20px",
									fontSize: "12px",
									boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
									cursor:
										this.props.isAnyTranscribing && !this.state.transcribing
											? "not-allowed"
											: "pointer"
								}}
							>
								{this.state.transcribing ? "Processing..." : "Transcribe"}
							</button>
						</div>
					)}
					<div style={fileNameStyle}>
						{attachment.file_name}
					</div>
				</div>
				{hasText &&<p onClick={this.showModal} style={{cursor:"pointer",color:"#007dc1",underlineOffset:"3px", textDecoration:"underline",fontSize:"10px", textAlign:"center"}}>View Transcription</p>}
				<div className="modal" tabIndex="-1" style={modalStyle}>
					<div
						className="modal-backdrop fade in"
						style={modalBackdropStyle}
						onClick={this.hideModal}
					/>
					<div className="modal-dialog" style={modalDialogStyle}>
						<div className="modal-content">
							<div className="modal-header">
								<button
									type="button"
									className="close"
									onClick={this.hideModal}
								>
									&times;
								</button>
								<h4 className="modal-title">
									{attachment.file_name}
								</h4>
							</div>

							<div className="modal-body text-center">
								<AudioPreview attachment={attachment} isOpen={this.state.display === "block"} onRetranscribe={this.handleTranscribe} isLoading={this.state.transcribing} />
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}