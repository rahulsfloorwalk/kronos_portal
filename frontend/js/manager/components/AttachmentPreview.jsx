import React from "react";
// import ReactDOM from 'react-dom';
import PropTypes from "prop-types";

import AttachmentProofIcon from "../../components/AttachmentProofIcon.jsx";
import Loading from "../../components/Loading.jsx";

import { DownloadAlt, Cross, Repeat, Plus, Minus } from "../../components/Icons.jsx";
import { attachmentPropType } from "../prop_types";

import Jumbotron from "../../components/Jumbotron.jsx";

import attachmentErrorImageUrl from "../../../img/error_100.png";

import { Player, BigPlayButton } from "video-react";
import AmrAudioPlayer from "../../components/AmrAudioPlayer.jsx";
import InPlaceEditable from "../../components/InPlaceEditable.jsx";
import heic2any from "heic2any";

class AttachmentRenderer extends React.Component {
	static propTypes = {
		attachment: attachmentPropType,
	};

	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			error: false,
			convertedUrl: null,
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
		const slug = this.props.attachment.file_slug || "";
		const Ext = slug.split(".").pop().toLowerCase();
		if (this.props.attachment.proof_type === "PHOTO") {
			this.setLoading(true);
			this.setError(false);
		}
		if (this.props.attachment.proof_type === "OTHER" && Ext === "heic") {
			this.convertHeicToJpeg(this.props.attachment.direct_url);
		}
	}

	componentWillReceiveProps(nextProps) {
		const prevId = this.props.attachment.id;
		const nextId = nextProps.attachment.id;
		const nextSlug = nextProps.attachment.file_slug || "";
		const nextExt = nextSlug.split(".").pop().toLowerCase();
		if (nextProps.attachment.proof_type === "PHOTO" && nextId !== prevId) {
			if (nextProps.attachment.id !== this.props.attachment.id) {
				this.setLoading(true);
				this.setError(false);
			}
		}
		if (nextProps.attachment.proof_type === "OTHER" && nextExt === "heic" && nextId !== prevId) {
			this.convertHeicToJpeg(nextProps.attachment.direct_url);
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
	convertHeicToJpeg = (url) => {
		this.setLoading(true);
		this.setError(false);

		fetch(url)
			.then((response) => response.blob())
			.then((blob) => heic2any({
				blob,
				toType: "image/jpeg",
				quality: 0.8,
			}))
			.then((convertedBlob) => {
				const convertedUrl = URL.createObjectURL(convertedBlob);
				this.setState({ convertedUrl, loading: false });
			})
			.catch(() => {
				this.setError(true);
				this.setLoading(false);
			});
	};

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
	skipAudio = (seconds) => {
		if (this.audio_tag) {
			this.audio_tag.currentTime += seconds;
		}
	};

	render() {
		const file_slug = this.props.attachment.file_slug || "";
		const file_extensionheic = file_slug.split(".").pop().toLowerCase();
		const isHeic = file_extensionheic === "heic";
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
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "5px",
							marginBottom: "15px",
						}}
					>
						{audio_player_node}
						<button
							onClick={() => this.skipAudio(-10)}
							style={{
								width: "40px",
								height: "40px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								backgroundColor: "#007dc1",
								border: "none",
								borderRadius: "50%",
								cursor: "pointer",
								transition: "background-color 0.3s, transform 0.2s",
								position: "relative",
								overflow: "visible",
							}}
							onMouseOver={(e) =>
								(e.currentTarget.style.backgroundColor = "#0056b3")
							}
							onMouseOut={(e) =>
								(e.currentTarget.style.backgroundColor = "#007dc1")
							}
							aria-label="Skip backward 10 seconds"
							title="10s Back"
						>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
								<polygon points="16,4 6,12 16,20" />
							</svg>
							<svg
								style={{
									position: "absolute",
									top: "-5px",
									left: "-5px",
									width: "50px",
									height: "50px",
								}}
								viewBox="0 0 100 100"
							>
								<path
									id="curve-back"
									d="M50,50 m-20,0 a20,20 0 1,1 40,0 a20,20 0 1,1 -40,0"
									fill="none"
								/>
								<text fontSize="14" fill="#fff">
									<textPath
										href="#curve-back"
										startOffset="25%"
										textAnchor="middle"
									>
										10s
									</textPath>
								</text>
							</svg>
						</button>

						<button
							onClick={() => this.skipAudio(10)}
							style={{
								width: "40px",
								height: "40px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								backgroundColor: "#28a745",
								border: "none",
								borderRadius: "50%",
								cursor: "pointer",
								transition: "background-color 0.3s, transform 0.2s",
								position: "relative",
								overflow: "visible",
							}}
							onMouseOver={(e) =>
								(e.currentTarget.style.backgroundColor = "#218838")
							}
							onMouseOut={(e) =>
								(e.currentTarget.style.backgroundColor = "#28a745")
							}
							aria-label="Skip forward 10 seconds"
							title="10s Forward"
						>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
								<polygon points="8,4 18,12 8,20" />
							</svg>
							<svg
								style={{
									position: "absolute",
									top: "-5px",
									left: "-5px",
									width: "50px",
									height: "45px",
								}}
								viewBox="0 0 100 100"
							>
								<path
									id="curve-forward"
									d="M50,50 m-20,0 a20,20 0 1,1 40,0 a20,20 0 1,1 -40,0"
									fill="none"
								/>
								<text fontSize="14" fill="#fff">
									<textPath
										href="#curve-forward"
										startOffset="25%"
										textAnchor="middle"
									>
										10s
									</textPath>
								</text>
							</svg>
						</button>
					</div>
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
				<div className="zoom-div">
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
			if (isHeic) {
				let error;
				if (this.state.error) {
					error = (
						<div className="text-center">
							<img src={attachmentErrorImageUrl} alt="error" />
							<p>Cannot load image</p>
						</div>
					);
				}

				let imageStyle = {
					display: this.state.loading ? "none" : "block",
					margin: "auto",
					width: "500px",
				};

				return (
					<div>
						{error}
						{this.state.loading ? (
							<Loading />
						) : (
							this.state.convertedUrl && (
								<div>
									<button
										type="button"
										className="btn btn-sm btn-default"
										onClick={this.zoomIn}
									>
										<Plus /> Zoom In
									</button>
									&nbsp;&nbsp;&nbsp;
									<button
										type="button"
										className="btn btn-sm btn-default"
										onClick={this.zoomOut}
									>
										<Minus /> Zoom Out
									</button>
									<div className="zoom-div">
										<img
											ref={(node) => (this.zoomImg = node)}
											className="zoom-img"
											style={imageStyle}
											src={this.state.convertedUrl}
											onLoad={this.onLoad}
											onError={this.onError}
										/>
									</div>
								</div>
							)
						)}
					</div>
				);
			}
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

export default class AttachmentPreview extends React.Component {
	static propTypes = {
		attachment: attachmentPropType,
		editable: PropTypes.bool,
		onDelete: PropTypes.func,
		onRename: PropTypes.func,
		proof_tags: PropTypes.array,
		onChange: PropTypes.func,
		rotateImage: PropTypes.func,
		disableRotateButton: PropTypes.bool
	};

	state = {
		display: "none",
		rotateButtonDisabled: false
	};

	showModal = () => {
		this.setState({ display: "block" });
	};

	hideModal = () => {
		this.setState({ display: "none" });
	};
	delete_hideModal = () => {
		this.props.onDelete();
		this.setState({ display: "none" });
	};
	render() {
		let proof_tag_select_box_style;

		if (!this.props.attachment) {
			return null;
		}

		let icon = <AttachmentProofIcon proofType={this.props.attachment.proof_type} />;
		let deleteButton;
		let rotateLeftButton;
		let rotateRightButton;
		let headingText;
		let proof_tag_select_box;
		let option_tag_list = [];

		for (let p of this.props.proof_tags) {
			option_tag_list.push(<option key={p.id} value={p.id}>{p.proof_tag}</option>);
		}

		let proof_tag_select_box_value;
		if (this.props.attachment.proof_tag) {
			proof_tag_select_box_value = this.props.attachment.proof_tag;
			proof_tag_select_box_style = {
				fontSize: "12px",
				width: "145px",
				height: "30px",
				marginRight: "1%",
				backgroundColor: "#DFF0D8",
			};
		}
		else {
			proof_tag_select_box_value = "";
			proof_tag_select_box_style = {
				fontSize: "12px",
				width: "145px",
				height: "30px",
				marginRight: "1%",
				backgroundColor: "#F2DEDE",
				border: "1px solid #ed0c0c",
			};
		}

		if (this.props.editable) {
			deleteButton = (<button type="button" className="btn btn-default btn-sm pull-right" onClick={this.showModal}><Cross /> Delete</button>);
			if (this.props.attachment.proof_type === "PHOTO") {
				rotateLeftButton = (
					<button type="button" className="btn btn-default" onClick={() => this.props.rotateImage("left")} disabled={this.props.disableRotateButton}>
						<Repeat /> Rotate Left
					</button>
				);
				rotateRightButton = (
					<button type="button" className="btn btn-default" onClick={() => this.props.rotateImage("right")} disabled={this.props.disableRotateButton}>
						<Repeat /> Rotate Right
					</button>
				);
			}
			headingText = (<InPlaceEditable inputText={this.props.attachment.file_name} onSave={this.props.onRename}>
				{icon} {this.props.attachment.file_name}
			</InPlaceEditable>);     //comment all for rename prooftag not editable
			// headingText = <span>{icon} {this.props.attachment.file_name}</span>;   //new line add for rename not editable

			if (option_tag_list.length > 0) {
				proof_tag_select_box = (<select className="form-control form-control-sm pull-right" value={proof_tag_select_box_value} onChange={this.props.onChange} style={proof_tag_select_box_style}>
					<option value="">Select Tag</option>
					{option_tag_list}
				</select>);
			}
		} else {
			headingText = (<span>{icon} {this.props.attachment.file_name}</span>);
			if (option_tag_list.length > 0) {
				proof_tag_select_box = (<select className="form-control form-control-sm pull-right" value={proof_tag_select_box_value} style={proof_tag_select_box_style} disabled>
					<option value="">Select Tag</option>
					{option_tag_list}
				</select>);
			}
		}

		let downloadButton = (
			<a className="btn btn-default hidden-print" href={this.props.attachment.direct_url}>
				<DownloadAlt /> Download File
			</a>
		);

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
		};

		return (
			<div>
				<h4 className="page-header">
					{deleteButton}
					{proof_tag_select_box}
					{headingText}
				</h4>
				<div className="text-center">
					<AttachmentRenderer attachment={this.props.attachment} />
					<br />
					{rotateLeftButton}
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					{downloadButton}
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					{rotateRightButton}
				</div>

				<div className="modal" tabIndex="-1" style={modalStyle}>
					<div className="modal-backdrop fade in" style={modalBackdropStyle} onClick={this.hideModal} />
					<div className="modal-dialog" style={modalDialogStyle}>
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" onClick={this.hideModal}>&times;</button>
								<h4 className="modal-title">Delete Attachment</h4>
							</div>
							<div className="modal-body">
								Are you sure you want to delete <b>{this.props.attachment.file_name}</b> attachment ?
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-default" onClick={this.delete_hideModal}>Yes</button>
								<button type="button" className="btn btn-default" onClick={this.hideModal}>No</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
