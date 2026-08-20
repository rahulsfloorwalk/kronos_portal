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
// import heic2any from "heic2any";
import libheif from "libheif-js";

class AttachmentRenderer extends React.Component {
	static propTypes = {
		attachment: attachmentPropType,
		editable: PropTypes.bool,
		onHighlightSave: PropTypes.func,
		onClose: PropTypes.func,
	};

	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			error: false,
			convertedUrl: null,
			annotationsByAttachmentId: {},
			highlightMode: false,
			savingHighlight: false
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

	componentWillUnmount() {
		document.removeEventListener("mousemove", this.onDragMove);
		document.removeEventListener("mouseup", this.stopDrag);
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
	// convertHeicToJpeg = (url) => {
	// 	this.setLoading(true);
	// 	this.setError(false);

	// 	fetch(url)
	// 		.then((response) => response.blob())
	// 		.then((blob) => heic2any({
	// 			blob,
	// 			toType: "image/jpeg",
	// 			quality: 0.8,
	// 		}))
	// 		.then((convertedBlob) => {
	// 			const convertedUrl = URL.createObjectURL(convertedBlob);
	// 			this.setState({ convertedUrl, loading: false });
	// 		})
	// 		.catch(() => {
	// 			this.setError(true);
	// 			this.setLoading(false);
	// 		});
	// };
	convertHeicToJpeg = (url) => {
		var self = this;
		self.setLoading(true);
		self.setError(false);

		return fetch(url)
			.then(function (response) {
				if (!response.ok) {
					throw new Error("Fetch failed: " + response.status);
				}
				return response.arrayBuffer();
			})
			.then(function (buffer) {
				var decoder = new libheif.HeifDecoder();
				var data = decoder.decode(new Uint8Array(buffer));

				if (!data || data.length === 0) {
					throw new Error("No images found in HEIF file");
				}

				var image = data[0];
				var width = image.get_width();
				var height = image.get_height();

				return new Promise(function (resolve, reject) {
					var pixelData = {
						data: new Uint8ClampedArray(width * height * 4),
						width: width,
						height: height,
						colorSpace: "srgb",
					};

					image.display(pixelData, function (displayResult) {
						if (!displayResult) {
							reject(new Error("Failed to display HEIF image"));
							return;
						}

						var canvas = document.createElement("canvas");
						canvas.width = width;
						canvas.height = height;
						var ctx = canvas.getContext("2d");

						var imgData = new ImageData(
							new Uint8ClampedArray(displayResult.data),
							width,
							height
						);
						ctx.putImageData(imgData, 0, 0);

						canvas.toBlob(
							function (blob) {
								if (!blob) {
									reject(new Error("Canvas toBlob failed"));
									return;
								}
								resolve(URL.createObjectURL(blob));
							},
							"image/jpeg",
							0.8
						);
					});
				});
			})
			.then(function (convertedUrl) {
				self.setState({ convertedUrl: convertedUrl, loading: false });
			})
			.catch(function (err) {
				console.error("HEIC conversion failed:", err);
				self.setState({ convertedUrl: url, loading: false, error: false });
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

	getAnnotations = () => {
		return this.state.annotationsByAttachmentId[this.props.attachment.id] || [];
	};

	// toggleHighlightMode = () => {
	// 	this.setState((oldState) => ({ highlightMode: !oldState.highlightMode }));
	// };

	// toggleHighlightMode = () => {
	// 	this.setState((oldState) => ({ highlightMode: !oldState.highlightMode }), () => {
	// 		if (!this.state.highlightMode) {
	// 			this.saveHighlightedImage();
	// 		}
	// 	});
	// };

	toggleHighlightMode = () => {
		if (this.state.highlightMode) {
			// "Done Highlighting" clicked — try to save; only exit highlight mode on success
			this.saveHighlightedImage();
		} else {
			this.setState({ highlightMode: true }, () => {
				this.addDefaultAnnotation();
			});
		}
	};

	addDefaultAnnotation = () => {
		const attachmentId = this.props.attachment.id;
		if (this.getAnnotations().length > 0) {
			return; // don't stack a default circle on top of existing annotations
		}
		const id = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
		this.setState((oldState) => ({
			annotationsByAttachmentId: {
				...oldState.annotationsByAttachmentId,
				[attachmentId]: [{ id, xPct: 50, yPct: 50, diameter: 40 }],
			},
		}));
	};

	generateHighlightedImageBlob = () => {
		const annotations = this.getAnnotations();
		if (annotations.length === 0) {
			return Promise.resolve(null);
		}
		const displayedWidth = this.zoomImg ? this.zoomImg.clientWidth : null;
		const sourceUrl = this.props.attachment.extra.preview_url;

		return fetch(sourceUrl)
			.then((response) => response.blob())
			.then((blob) => {
				const objectUrl = URL.createObjectURL(blob);
				return new Promise((resolve, reject) => {
					const img = new Image();
					img.onload = () => {
						const canvas = document.createElement("canvas");
						canvas.width = img.naturalWidth;
						canvas.height = img.naturalHeight;
						const ctx = canvas.getContext("2d");
						ctx.drawImage(img, 0, 0);

						const scaleFactor = displayedWidth ? (img.naturalWidth / displayedWidth) : 1;

						annotations.forEach((a) => {
							const cx = (a.xPct / 100) * img.naturalWidth;
							const cy = (a.yPct / 100) * img.naturalHeight;
							const radius = (a.diameter / 2) * scaleFactor;

							ctx.beginPath();
							ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
							ctx.strokeStyle = "#ff3b30";
							ctx.lineWidth = Math.max(2, 3 * scaleFactor);
							ctx.stroke();
						});

						canvas.toBlob((outBlob) => {
							URL.revokeObjectURL(objectUrl);
							if (outBlob) {
								resolve(outBlob);
							} else {
								reject(new Error("Canvas toBlob failed"));
							}
						}, "image/jpeg", 0.92);
					};
					img.onerror = (err) => {
						URL.revokeObjectURL(objectUrl);
						reject(err);
					};
					img.src = objectUrl;
				});
			});
	};

	saveHighlightedImage = () => {
		if (!this.props.onHighlightSave) {
			this.setState({ highlightMode: false });
			return;
		}
		this.setState({ savingHighlight: true });
		this.generateHighlightedImageBlob()
			.then((blob) => {
				if (!blob) {
					this.setState({ savingHighlight: false, highlightMode: false });
					return null;
				}
				return Promise.resolve(this.props.onHighlightSave(blob, this.props.attachment))
					.then(() => {
						this.setState({ savingHighlight: false, highlightMode: false });
						this.props.onClose();
					});
			})
			.catch((err) => {
				console.error("Failed to save highlighted image:", err);
				this.setState({ savingHighlight: false });
			});
	};

	addAnnotation = (e) => {
		if (!this.props.editable || !this.state.highlightMode) {
			return;
		}
		const rect = e.currentTarget.getBoundingClientRect();
		const xPct = ((e.clientX - rect.left) / rect.width) * 100;
		const yPct = ((e.clientY - rect.top) / rect.height) * 100;
		const id = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
		const attachmentId = this.props.attachment.id;

		this.setState((oldState) => {
			const existing = oldState.annotationsByAttachmentId[attachmentId] || [];
			return {
				annotationsByAttachmentId: {
					...oldState.annotationsByAttachmentId,
					[attachmentId]: [...existing, { id, xPct, yPct, diameter: 40 }],
				},
			};
		});
	};

	startMove = (annotationId, e) => {
		e.stopPropagation();
		e.preventDefault();
		const containerRect = e.currentTarget.closest(".zoom-div").getBoundingClientRect();
		const annotation = this.getAnnotations().find((a) => a.id === annotationId);
		if (!annotation) return;

		this.dragInfo = {
			mode: "move",
			id: annotationId,
			containerRect,
			startClientX: e.clientX,
			startClientY: e.clientY,
			startXPct: annotation.xPct,
			startYPct: annotation.yPct,
		};
		document.addEventListener("mousemove", this.onDragMove);
		document.addEventListener("mouseup", this.stopDrag);
	};

	startResize = (annotationId, e) => {
		e.stopPropagation();
		e.preventDefault();
		const annotation = this.getAnnotations().find((a) => a.id === annotationId);
		if (!annotation) return;

		this.dragInfo = {
			mode: "resize",
			id: annotationId,
			startClientX: e.clientX,
			startClientY: e.clientY,
			startDiameter: annotation.diameter,
		};
		document.addEventListener("mousemove", this.onDragMove);
		document.addEventListener("mouseup", this.stopDrag);
	};

	onDragMove = (e) => {
		if (!this.dragInfo) return;
		const attachmentId = this.props.attachment.id;
		const { mode, id } = this.dragInfo;

		if (mode === "move") {
			const { containerRect, startClientX, startClientY, startXPct, startYPct } = this.dragInfo;
			const dxPct = ((e.clientX - startClientX) / containerRect.width) * 100;
			const dyPct = ((e.clientY - startClientY) / containerRect.height) * 100;
			const newXPct = Math.max(0, Math.min(100, startXPct + dxPct));
			const newYPct = Math.max(0, Math.min(100, startYPct + dyPct));

			this.setState((oldState) => {
				const existing = oldState.annotationsByAttachmentId[attachmentId] || [];
				return {
					annotationsByAttachmentId: {
						...oldState.annotationsByAttachmentId,
						[attachmentId]: existing.map((a) =>
							a.id === id ? { ...a, xPct: newXPct, yPct: newYPct } : a
						),
					},
				};
			});
		}
		else if (mode === "resize") {
			const { startClientX, startClientY, startDiameter } = this.dragInfo;
			const delta = Math.max(e.clientX - startClientX, e.clientY - startClientY);
			const newDiameter = Math.max(16, Math.min(400, startDiameter + delta));

			this.setState((oldState) => {
				const existing = oldState.annotationsByAttachmentId[attachmentId] || [];
				return {
					annotationsByAttachmentId: {
						...oldState.annotationsByAttachmentId,
						[attachmentId]: existing.map((a) =>
							a.id === id ? { ...a, diameter: newDiameter } : a
						),
					},
				};
			});
		}
	};

	stopDrag = () => {
		this.dragInfo = null;
		document.removeEventListener("mousemove", this.onDragMove);
		document.removeEventListener("mouseup", this.stopDrag);
	};

	removeAnnotation = (id) => {
		const attachmentId = this.props.attachment.id;
		this.setState((oldState) => {
			const existing = oldState.annotationsByAttachmentId[attachmentId] || [];
			return {
				annotationsByAttachmentId: {
					...oldState.annotationsByAttachmentId,
					[attachmentId]: existing.filter((a) => a.id !== id),
				},
			};
		});
	};

	renderAnnotations = () => {
		return this.getAnnotations().map((a) => (
			<div
				key={a.id}
				onMouseDown={(e) => this.startMove(a.id, e)}
				style={{
					position: "absolute",
					left: a.xPct + "%",
					top: a.yPct + "%",
					width: a.diameter + "px",
					height: a.diameter + "px",
					marginLeft: -(a.diameter / 2) + "px",
					marginTop: -(a.diameter / 2) + "px",
					border: "3px solid #ff3b30",
					borderRadius: "50%",
					boxShadow: "0 0 4px rgba(0,0,0,0.5)",
					cursor: "move",
				}}
			>
				<button
					type="button"
					onMouseDown={(e) => e.stopPropagation()}
					onClick={(e) => {
						e.stopPropagation();
						this.removeAnnotation(a.id);
					}}
					style={{
						position: "absolute",
						top: "-10px",
						right: "-10px",
						width: "18px",
						height: "18px",
						lineHeight: "16px",
						padding: 0,
						borderRadius: "50%",
						border: "1px solid #ff3b30",
						backgroundColor: "#fff",
						color: "#ff3b30",
						fontSize: "12px",
						cursor: "pointer",
					}}
				>
					×
				</button>
				<div
					onMouseDown={(e) => this.startResize(a.id, e)}
					style={{
						position: "absolute",
						bottom: "-6px",
						right: "-6px",
						width: "12px",
						height: "12px",
						borderRadius: "50%",
						backgroundColor: "#ff3b30",
						border: "2px solid #fff",
						cursor: "nwse-resize",
					}}
				/>
			</div>
		));
	};
	render() {
		const file_slug = this.props.attachment.file_slug || "";
		const { mime_type} = this.props.attachment;
		const isAmrMime = mime_type === "audio/AMR" || mime_type === "audio/amr";
		const isAmrExt = typeof file_slug === "string" && file_slug.toLowerCase().endsWith(".amr");

		switch (this.props.attachment.proof_type) {
		case "AUDIO": {
			let audio_player_node;
			let audio_transcipt_table_data;
			let audio_transcipt_rows = [];
			// const audio_transcript_data = (this.props.attachment.audio_transcript_data).hasOwnProperty("transcript_list") ? this.props.attachment.audio_transcript_data["transcript_list"] : [];
			const audio_transcript_data = (this.props.attachment.audio_transcript_data && this.props.attachment.audio_transcript_data.transcript_list) || [];
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
			// if (this.props.attachment.mime_type == "audio/AMR" || this.props.attachment.mime_type == "audio/amr") {
			// 	audio_player_node = <AmrAudioPlayer audioRef={node => this.audio_tag = node} attachment={this.props.attachment} />;
			// }
			if (isAmrMime || isAmrExt) {
				audio_player_node = (
					<AmrAudioPlayer
						audioRef={(node) => (this.audio_tag = node)}
						attachment={this.props.attachment}
					/>
				);
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
		// case "PHOTO": {
		// 	let loading, error;
		// 	if (this.state.loading) {
		// 		loading = <Loading />;
		// 	}
		// 	if (this.state.error) {
		// 		error = (<div className="text-center">
		// 			<img src={attachmentErrorImageUrl} />
		// 			<p>cannot load image</p>
		// 		</div>);
		// 	}

		// 	let imageStyle = {
		// 		"display": this.state.loading ? "none" : "block",
		// 		"margin": "auto",
		// 	};
		// 	return (<div>
		// 		{loading}
		// 		{error}
		// 		<button type="button" className="btn btn-sm btn-default" onClick={this.zoomIn}><Plus /> Zoom In</button>
		// 		&nbsp;&nbsp;&nbsp;
		// 		<button type="button" className="btn btn-sm btn-default" onClick={this.zoomOut}><Minus /> Zoom Out</button>
		// 		{/* <div className="zoom-div">
		// 			<img ref={node => this.zoomImg = node} style={imageStyle} className="zoom-img" src={this.props.attachment.extra.preview_url} onLoad={this.onLoad} onError={this.onError} />
		// 		</div> */}
		// 		<button type="button" className="btn btn-sm btn-default" onClick={this.zoomIn}><Plus /> Zoom In</button>
		// 	&nbsp;&nbsp;&nbsp;
		// 	<button type="button" className="btn btn-sm btn-default" onClick={this.zoomOut}><Minus /> Zoom Out</button>
		// 	&nbsp;&nbsp;&nbsp;
		// 	{this.props.editable && (
		// 		<button
		// 			type="button"
		// 			className={"btn btn-sm " + (this.state.highlightMode ? "btn-primary" : "btn-default")}
		// 			onClick={this.toggleHighlightMode}
		// 		>
		// 			{this.state.highlightMode ? "Done Highlighting" : "Add Highlight"}
		// 		</button>
		// 	)}
		// 	<div className="zoom-div" style={{ position: "relative", display: "inline-block" }}>
		// 		<img
		// 			ref={node => this.zoomImg = node}
		// 			style={{ ...imageStyle, cursor: this.state.highlightMode ? "crosshair" : "default" }}
		// 			className="zoom-img"
		// 			src={this.props.attachment.extra.preview_url}
		// 			onLoad={this.onLoad}
		// 			onError={this.onError}
		// 			onClick={this.addAnnotation}
		// 		/>
		// 		{this.renderAnnotations()}
		// 	</div>
		// 	</div>
		// 	);
		// }
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
				&nbsp;&nbsp;&nbsp;
				{this.props.editable && (
					<button
						type="button"
						className={"btn btn-sm " + (this.state.highlightMode ? "btn-primary" : "btn-default")}
						onClick={this.toggleHighlightMode}
						disabled={this.state.savingHighlight}
					>
						{this.state.savingHighlight
							? "Saving..."
							: (this.state.highlightMode ? "Done Highlighting" : "Add Highlight")}
					</button>
				)}
				{/* <div className="zoom-div" style={{ position: "relative", display: "inline-block" }}> */}
				<div className="zoom-div" style={{ position: "relative" }}>
					<img
						ref={node => this.zoomImg = node}
						style={{ ...imageStyle, cursor: this.state.highlightMode ? "crosshair" : "default" }}
						className="zoom-img"
						src={this.props.attachment.extra.preview_url}
						onLoad={this.onLoad}
						onError={this.onError}
						onClick={this.addAnnotation}
					/>
					{this.renderAnnotations()}
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
		case "OTHER": {
			var slug = this.props.attachment.file_slug || "";
			var fileExtension = slug.split(".").pop().toLowerCase();
			var mimeType = (this.props.attachment.mime_type || "").toLowerCase();

			// HEIC images
			if (fileExtension === "heic") {
				var errorNode = null;
				if (this.state.error) {
					errorNode = (
						<div className="text-center">
							<img src={attachmentErrorImageUrl} alt="error" />
							<p>Cannot load image</p>
						</div>
					);
				}

				var imageStyle = {
					display: this.state.loading ? "none" : "block",
					margin: "auto",
					width: "500px"
				};

				return (
					<div>
						{errorNode}
						{this.state.loading ? (
							<Loading />
						) : (
							this.state.convertedUrl && (
								<div>
									<button
										type="button"
										className="btn btn-sm btn-default"
										onClick={this.zoomIn.bind(this)}
									>
										<Plus /> Zoom In
									</button>
									&nbsp;&nbsp;&nbsp;
									<button
										type="button"
										className="btn btn-sm btn-default"
										onClick={this.zoomOut.bind(this)}
									>
										<Minus /> Zoom Out
									</button>
									<div className="zoom-div">
										<img
											ref={function(node) { this.zoomImg = node; }.bind(this)}
											className="zoom-img"
											style={imageStyle}
											src={this.state.convertedUrl}
											onLoad={this.onLoad.bind(this)}
											onError={this.onError.bind(this)}
										/>
									</div>
								</div>
							)
						)}
					</div>
				);
			}

			// AMR audio
			if (fileExtension === "amr" || mimeType === "audio/amr") {
				var transcriptData = this.props.attachment.audio_transcript_data && this.props.attachment.audio_transcript_data.transcript_list || [];
				var transcriptTable = null;

				if (transcriptData.length > 0) {
					transcriptTable = (
						<table className="table table-bordered table-hover">
							<thead>
								<tr>
									<th>Transcript data</th>
									<th>End Time</th>
								</tr>
							</thead>
							<tbody>
								{transcriptData.map(function(tl, idx) {
									return (
										<tr key={idx}>
											<td>{tl.transcript_data}</td>
											<td>{tl.end_time}</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					);
				}
				else {
					transcriptTable = (
						<Jumbotron heading="Not found" para="Audio transcription not available for this attachment" />
					);
				}

				return (
					<div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "5px",
								marginBottom: "15px",
							}}
						>
							<AmrAudioPlayer audioRef={function(node) { this.audio_tag = node; }.bind(this)} attachment={this.props.attachment} />
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
						<div style={{ overflowY: "auto", maxHeight: "400px", marginTop: "10px" }}>
							{transcriptTable}
						</div>
					</div>
				);
			}

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
		disableRotateButton: PropTypes.bool,
		onClose: PropTypes.func,
		onHighlightSave: PropTypes.func
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

		let closeButton;
		if (this.props.onClose) {
			closeButton = (
				<button type="button" className="btn btn-default btn-sm pull-right" onClick={this.props.onClose} style={{ marginLeft: "5px" }}>
					<Cross /> Close
				</button>
			);
		}

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
					{closeButton}
					{deleteButton}
					{proof_tag_select_box}
					{headingText}
				</h4>
				<div className="text-center">
					<AttachmentRenderer attachment={this.props.attachment} editable={this.props.editable} onHighlightSave={this.props.onHighlightSave} onClose={this.props.onClose}/>
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
