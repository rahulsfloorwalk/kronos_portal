import React, { Component } from "react";
import PropTypes from "prop-types";
import AmrAudioPlayer from "../../components/AmrAudioPlayer.jsx";

export default class AudioPreview extends Component {
	static propTypes = {
		attachment: PropTypes.object.isRequired,
		isOpen: PropTypes.bool,
		onRetranscribe: PropTypes.func,
		isLoading: PropTypes.bool
	};

	skipAudio = (seconds) => {
		if (this.audio_tag) {
			this.audio_tag.currentTime += seconds;
		}
	};

	componentDidUpdate(prevProps) {
		// when modal closes
		if (prevProps.isOpen && !this.props.isOpen) {
			if (this.audio_tag && this.audio_tag.pause) {
				this.audio_tag.pause();
				this.audio_tag.currentTime = 0;
			}
		}
	}
	render() {
		const { attachment } = this.props;

		const rowText =
			typeof attachment.audio_to_text_row === "string"
				? attachment.audio_to_text_row
				: "";

		const cleanText =
			typeof attachment.audio_to_text_clean === "string"
				? attachment.audio_to_text_clean
				: "";

		const hasTranscript = rowText.trim().length > 0;

		const file_slug = attachment.file_slug || "";
		const mime_type = attachment.mime_type || "";

		const isAmrMime =
			mime_type === "audio/AMR" || mime_type === "audio/amr";
		const isAmrExt =
			file_slug.toLowerCase().endsWith(".amr");

		let audio_player_node;

		if (isAmrMime || isAmrExt) {
			audio_player_node = (
				<AmrAudioPlayer
					audioRef={(node) => (this.audio_tag = node)}
					attachment={attachment}
				/>
			);
		} else {
			audio_player_node = (
				<audio
					ref={(node) => (this.audio_tag = node)}
					controls
					style={{ maxWidth: "100%" }}
				>
					<source
						src={attachment.direct_url}
						type={attachment.mime_type}
					/>
				</audio>
			);
		}

		return (
			<div>
				<p><b>Please download file if you are not able to play it.</b></p>

				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "10px",
						marginBottom: "20px"
					}}
				>
					{audio_player_node}

					<button
						onClick={() => this.skipAudio(-10)}
						className="btn btn-default"
					>
						⏪ 10s
					</button>

					<button
						onClick={() => this.skipAudio(10)}
						className="btn btn-default"
					>
						10s ⏩
					</button>
				</div>

				{hasTranscript && (
					<div style={{ textAlign: "left" }}>
						<div style={{ textAlign: "right", marginBottom: "10px" }}>
							<button
								className="btn btn-xs btn-warning"
								onClick={this.props.onRetranscribe}
								disabled={this.props.isLoading}
								style={{
									borderRadius: "15px",
									padding: "5px 10px",
									display: "flex",
									alignItems: "center",
									gap: "5px",
									opacity: this.props.isLoading ? 0.7 : 1,
									cursor: this.props.isLoading ? "not-allowed" : "pointer"
								}}
							>
								{this.props.isLoading ? (
									<>
										<span
											className="spinner-border spinner-border-xs"
											style={{
												width: "12px",
												height: "12px",
												border: "2px solid white",
												borderTop: "2px solid transparent",
												borderRadius: "50%",
												display: "inline-block",
												animation: "spin 0.6s linear infinite"
											}}
										/>
										Processing...
									</>
								) : (
									"🔁 Re-Transcribe"
								)}
							</button>
						</div>
						{/* RAW */}
						<div
							style={{
								border: "1px solid #ddd",
								borderRadius: "6px",
								padding: "12px",
								marginBottom: "15px",
								background: "#f9f9f9"
							}}
						>
							<h5><b>Raw Transcript</b></h5>
							<div style={{ fontSize: "13px", lineHeight: "1.6" }}>
								{rowText}
							</div>
						</div>

						{/* CLEAN */}
						{attachment.audio_to_text_clean && (
							<div
								style={{
									border: "1px solid #c3e6cb",
									borderRadius: "6px",
									padding: "12px",
									background: "#eafaf1"
								}}
							>
								<h5 style={{ color: "#155724" }}>
									<b>Summarized Transcript</b>
								</h5>
								<div style={{ fontSize: "13px", lineHeight: "1.6" }}>
									{cleanText}
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		);
	}
}