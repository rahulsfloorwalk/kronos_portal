import React from "react";
// import ReactDOM from 'react-dom';
import PropTypes from "prop-types";

import AttachmentProofIcon from "../../../components/AttachmentProofIcon.jsx";
import Loading from "../../../components/Loading.jsx";

import { DownloadAlt } from "../../../components/Icons.jsx";
import { attachmentPropType } from "../../prop_types";

import attachmentErrorImageUrl from "../../../../img/error_100.png";

import { Player, BigPlayButton } from "video-react";
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
		if (nextProps.attachment.proof_type === "PHOTO") {
			if (nextProps.attachment.id !== this.props.attachment.id) {
				this.setLoading(true);
				this.setError(false);
			}
		}
		if (
			nextProps.attachment.proof_type === "OTHER" &&
			nextExt === "heic" &&
			nextId !== prevId
		) {
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
			.then((blob) =>
				heic2any({
					blob,
					toType: "image/jpeg",
					quality: 0.8,
				})
			)
			.then((convertedBlob) => {
				const convertedUrl = URL.createObjectURL(convertedBlob);
				this.setState({ convertedUrl, loading: false });
			})
			.catch((err) => {
				console.error("HEIC conversion error:", err);
				this.setError(true);
				this.setLoading(false);
			});
	};


	render() {
		const file_slug = this.props.attachment.file_slug || "";
		const file_extensionheic = file_slug.split(".").pop().toLowerCase();
		const isHeic = file_extensionheic === "heic";
		switch (this.props.attachment.proof_type) {
		case "AUDIO": {
			return (
				<div>
					<p><b>Please download file if you are not able to play it.</b></p>
					<audio ref={node => this.audio_tag = node} controls>
						<source src={this.props.attachment.direct_url}
							type={this.props.attachment.mime_type} />
					</audio>
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
				"maxWidth": "100%",
				"maxHeight": "500px",
				"margin": "auto",
			};
			return (<div style={{ "textAlign": "center" }}>
				{loading}
				{error}
				<img src={this.props.attachment.extra.preview_url} style={imageStyle} onLoad={this.onLoad} onError={this.onError} />
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
			return null;
		}
	}
}

export default class AttachmentPreview extends React.Component {
	static propTypes = {
		attachment: attachmentPropType,
		editable: PropTypes.bool,
	};

	render() {
		if (!this.props.attachment) {
			return null;
		}

		let icon = <AttachmentProofIcon proofType={this.props.attachment.proof_type} />;
		let headingText;

		headingText = (<span>{icon} {this.props.attachment.file_name}</span>);

		let downloadButton = (
			<a className="btn btn-default hidden-print" href={this.props.attachment.direct_url}>
				<DownloadAlt /> Download File
			</a>
		);

		return (
			<div>
				<h4 className="page-header">
					{headingText}
				</h4>
				<div className="text-center">
					<AttachmentRenderer attachment={this.props.attachment} />
					<br />
					{downloadButton}
				</div>
			</div>
		);
	}
}
