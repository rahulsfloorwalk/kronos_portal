import React, { Component } from "react";
import PropTypes from "prop-types";
import { DownloadAlt, Cross, Plus, Minus } from "../../components/Icons.jsx";
import { attachmentPropType } from "../../manager/prop_types.js";
import Loading from "../../components/Loading.jsx";
import { Player, BigPlayButton } from "video-react";
import Jumbotron from "../../components/Jumbotron.jsx";
import AmrAudioPlayer from "../../components/AmrAudioPlayer.jsx";
import attachmentErrorImageUrl from "../../../img/error_100.png";
import "../../../css/bs_overrides.scss";


class AttachmentRenderer extends React.Component {
	static propTypes = {
		attachment: attachmentPropType,
	};

	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			error: false,
		};
	}

	setLoading = (loading) => {
		this.setState((oldState) => Object.assign({}, oldState, { loading }));
	};
	setError = (error) => {
		this.setState((oldState) => Object.assign({}, oldState, { error }));
	};

	onLoad = () => {
		this.setLoading(false);
	};

	onError = () => {
		this.setError(true);
		this.setLoading(false);
	};

	componentDidMount() {
		if (this.props.attachment.proof_type === "PHOTO") {
			this.setLoading(true);
			this.setError(false);
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.attachment.proof_type === "PHOTO") {
			if (nextProps.attachment.id !== this.props.attachment.id) {
				this.setLoading(true);
				this.setError(false);
			}
		}
		if (nextProps.attachment.proof_type === "AUDIO") {
			if (nextProps.attachment.proof_type === this.props.attachment.proof_type) {
				const audio = this.audio_tag;
				const source = audio.querySelector("source");

				if (nextProps.attachment.id !== this.props.attachment.id) {
					source.src = nextProps.attachment.direct_url;
					audio.load();
				}
			}
		}
		if (nextProps.attachment.proof_type === "VIDEO") {
			if (nextProps.attachment.proof_type === this.props.attachment.proof_type) {
				if (nextProps.attachment.id !== this.props.attachment.id) {
					this.player.load();
				}
			}
		}
	}

	zoomIn = () => {
		var imgProof = this.zoomImg;
		var currWidth = imgProof.clientWidth;
		if (currWidth == 2500) {
			return false;
		}
		else {
			imgProof.style.width = (currWidth + 100) + "px";
		}
	};

	zoomOut = () => {
		var imgProof = this.zoomImg;
		var currWidth = imgProof.clientWidth;
		if (currWidth == 100) {
			return false;
		}
		else {
			imgProof.style.width = (currWidth - 100) + "px";
		}
	};

	render() {

		let file_extension_arr = (this.props.attachment.file_slug).split(".");
		let file_extension = file_extension_arr[file_extension_arr.length - 1];
		switch (this.props.attachment.proof_type) {
		case "AUDIO": {
			let audio_player_node;
			let audio_transcipt_table_data;
			let audio_transcipt_rows = [];
			const audio_transcript_data = (this.props.attachment.audio_transcript_data).hasOwnProperty("transcript_list") ? this.props.attachment.audio_transcript_data["transcript_list"] : [];
			let count_key = 1;
			for (let tl of audio_transcript_data) {
				audio_transcipt_rows.push(
					<tr key={count_key}>
						<td>{tl.transcript_data}</td>
						<td>{tl.end_time}</td>
					</tr>
				);
				count_key += 1;
			}
			if (audio_transcipt_rows.length > 0) {
				audio_transcipt_table_data = (
					<table className="table table-bordered">
						<thead>
							<tr>
								<th>Transcript data</th>
								<th>End Time</th>
							</tr>
						</thead>
						<tbody>
							{audio_transcipt_rows}
						</tbody>
					</table>
				);
			}
			else {
				audio_transcipt_table_data = (<Jumbotron heading="Not found" para="Audio transcription not available for this attachment" />);
			}
			if (this.props.attachment.mime_type == "audio/AMR" || this.props.attachment.mime_type == "audio/amr") {
				audio_player_node = <AmrAudioPlayer audioRef={node => this.audio_tag = node} attachment={this.props.attachment} />;
			}
			else {
				audio_player_node = (<audio ref={node => this.audio_tag = node} controls>
					<source src={this.props.attachment.direct_url}
						type={this.props.attachment.mime_type} />
				</audio>);
			}
			return (
				<div>
					<p><b>Please download file if you are not able to play it.</b></p>
					{audio_player_node}
					<div style={{ overflowY: "auto", maxHeight: "400px" }}>
						{audio_transcipt_table_data}
					</div>
				</div>
			);
		}
		case "PHOTO": {
			let loading, error;
			if (this.state.loading) {
				loading = <Loading />;
			}
			if (this.state.error) {
				error = (<div className="text-center">
					<img src={attachmentErrorImageUrl} />
					<p>cannot load image</p>
				</div>);
			}

			let imageStyle = {
				"display": this.state.loading ? "none" : "block",
				"margin": "auto",
			};
			return (<div>
				{loading}
				{error}
				<button type="button" className="btn btn-sm btn-default" onClick={this.zoomIn}><Plus /> Zoom In</button>
				&nbsp;&nbsp;&nbsp;
				<button type="button" className="btn btn-sm btn-default" onClick={this.zoomOut}><Minus /> Zoom Out</button>
				<div className="zoom-div" style={{ maxWidth: "80%", margin: "0 auto" }}>
					<img ref={node => this.zoomImg = node} style={imageStyle} className="zoom-img" src={this.props.attachment.extra.preview_url} onLoad={this.onLoad} onError={this.onError} />
				</div>
			</div>
			);
		}
		case "VIDEO": {
			return (
				// <video ref={node => this.video_tag = node} width="600" height="310" controls>
				// 	<source src={this.props.attachment.direct_url}
				// 		type={this.props.attachment.mime_type}/>
				// </video>
				<center>
					<p><b>Please download file if you are not able to play it.</b></p>
					<Player fluid={false} width={600} height={350} ref={node => this.player = node}>
						<BigPlayButton position="center" />
						<source src={this.props.attachment.direct_url} />
					</Player>
				</center>

			);
			// return (<p>Please download this file.</p>);
		}
		case "OTHER":
			if (file_extension == "amr") {
				let audio_transcipt_table_data;
				let audio_transcipt_rows = [];
				const audio_transcript_data = (this.props.attachment.audio_transcript_data).hasOwnProperty("transcript_list") ? this.props.attachment.audio_transcript_data["transcript_list"] : [];
				let count_key = 1;
				for (let tl of audio_transcript_data) {
					audio_transcipt_rows.push(
						<tr key={count_key}>
							<td>{tl.transcript_data}</td>
							<td>{tl.end_time}</td>
						</tr>
					);
					count_key += 1;
				}
				if (audio_transcipt_rows.length > 0) {
					audio_transcipt_table_data = (
						<table className="table table-bordered table-hover">
							<thead>
								<tr>
									<th>Transcript data</th>
									<th>End Time</th>
								</tr>
							</thead>
							<tbody>
								{audio_transcipt_rows}
							</tbody>
						</table>
					);
				}
				else {
					audio_transcipt_table_data = (<Jumbotron heading="Not found" para="Audio transcription not available for this attachment" />);
				}
				return (
					<div style={{ overflowY: "auto", maxHeight: "400px" }}>
						<p><b>.amr audio file does not support on browser, so you have to download the file.</b></p>
						{audio_transcipt_table_data}
					</div>
				);
			}
			else {
				return null;
			}
		}
	}
}
class MandatoryAttachmentBiggerModal extends Component {
	static propTypes = {
		attachment: PropTypes.object,
		onClose: PropTypes.func.isRequired,
	};
	render() {
		const { attachment, onClose } = this.props;
		let downloadButton = (
			<a className="btn btn-default hidden-print" href={attachment.direct_url}>
				<DownloadAlt /> Download File
			</a>
		);

		if (!attachment) return null;

		const modalStyle = {
			position: "fixed",
			top: "50%",
			left: "50%",
			transform: "translate(-50%, -50%)",
			background: "#fff",
			padding: "20px",
			borderRadius: "8px",
			boxShadow: "0px 0px 15px rgba(0,0,0,0.2)",
			zIndex: 1000,
			width: "800px",
			maxHeight: "90vh", // limit modal height
			overflowY: "auto"
		};

		const overlayStyle = {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "rgba(0,0,0,0.5)",
			zIndex: 999,
		};
		return (
			<>
				<div style={overlayStyle} onClick={onClose} />
				<div style={modalStyle}>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<h4>Attachment Details</h4>
						<button onClick={onClose} style={{ marginTop: "10px" }}><Cross /></button>
					</div>
					<div className="text-center">
						<AttachmentRenderer attachment={attachment} />
						<br />
						{downloadButton}
					</div>
				</div>
			</>
		);
	}
}



export default MandatoryAttachmentBiggerModal;