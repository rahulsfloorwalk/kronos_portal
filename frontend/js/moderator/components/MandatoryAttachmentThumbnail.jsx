import React, { Component } from "react";
import PropTypes from "prop-types";

import { truncateStyle, pointerStyle } from "../../styles.js";
import AttachmentProofIcon from "../../components/AttachmentProofIcon.jsx";
import { Cross } from "../../components/Icons.jsx";
import loadingImageUrl from "../../../img/ripple.svg";
import attachmentErrorImgUrl from "../../../img/error_100.png";
import attachmentMicrophoneImgUrl from "../../../img/microphone_100.png";
import attachmentFilmImgUrl from "../../../img/film_100.png";
import attachmentFileImgUrl from "../../../img/file_100.png";
import MandatoryAttachmentBiggerModal from "./MandatoryAttachmentBiggerModal.jsx";

export default class MandatoryAttachmentThumbnail extends Component {
	static propTypes = {
		attachment: PropTypes.shape({
			id: PropTypes.number.isRequired,
			proof_type: PropTypes.string.isRequired,
			file_name: PropTypes.string,
			proof_tag: PropTypes.any,
		}),
		user: PropTypes.string,
		selected: PropTypes.bool,
		deletable: PropTypes.bool,

		onSelect: PropTypes.func,
		onDelete: PropTypes.func,

		editable: PropTypes.bool,

		faulty_report_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

		proof_tags: PropTypes.array,
		onChange: PropTypes.func,
		faulty_attachment_url: PropTypes.string,
		section_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
	};

	constructor(props) {
		super(props);
		this.state = {
			hover: false,
			loading: false,
			error: false,
			display: "none",
			showModal: false,
		};
	}
	showDeleteModal = (e) => {
		e.stopPropagation();
		this.setState({ display: "block" });
	};

	hideDeleteModal = () => {
		this.setState({ display: "none" });
	};
	delete_hideModal = () => {
		this.props.onDelete();
		this.setState({ display: "none" });
	};

	showModal = () => {
		this.setState({ showModal: true });
	};

	hideModal = () => {
		this.setState({ showModal: false });
	};

	setHover = (hover) => {
		this.setState((prevState) => Object.assign({}, prevState, { hover }));
	};
	onMouseEnter = () => {
		this.setHover(true);
	};
	onMouseLeave = () => {
		this.setHover(false);
	};
	setLoading = (loading) => {
		this.setState((prevState) => Object.assign({}, prevState, { loading }));
	};
	setError = (error) => {
		this.setState((prevState) => Object.assign({}, prevState, { error }));
	};
	onImageLoad = () => {
		this.setLoading(false);
	};
	onImageError = () => {
		this.setLoading(false);
		this.setError(true);
	};

	componentDidMount() {
		if (this.props.attachment && this.props.attachment.proof_type === "PHOTO") {
			this.setLoading(true);
		}
	}
	componentWillReceiveProps(nextProps) {
		if (
			nextProps.attachment &&
			nextProps.attachment.id !== this.props.attachment.id
		) {
			if (nextProps.attachment && nextProps.attachment.proof_type === "PHOTO") {
				this.setLoading(true);
			}
		}
	}
	render() {
		let a = this.props.attachment;
		let proof_tag_select_box_style;
		let selected = this.props.selected || false;
		// let onSelect = this.props.onSelect || (() => { });
		let selectable = !!this.props.onSelect;

		let divStyle = Object.assign({}, pointerStyle, {
			display: "inline-block",
			width: "150px",
			height: "100px",
			backgroundPosition: "center center",
			backgroundRepeat: "no-repeat",
			position: "relative",
			border: "solid LightGray 1px",
			borderRadius: "3px",
			backgroundColor: "LightGray",
			margin: "5px",
		});

		let fileNameStyle = Object.assign({}, truncateStyle, {
			color: "Black",
			backgroundColor: "rgba(255,255,255,0.8)",
			width: "100%",
			position: "absolute",
			bottom: "0px",
			padding: "2px",
			paddingLeft: "5px",
			borderBottomLeftRadius: "3px",
			borderBottomRightRadius: "3px",
		});

		let anchorStyle = {
			color: "Black",
		};

		if (this.state.hover) {
			divStyle.border = "solid #337AB7 2px";
		}

		// ---------------------------------


		/*var contentStyle = {
		  "width": "20px",
		  "height": "20px",
		};*/

		// var faulty_style = {
		//   "fontSize": "14px",
		//   "color": "red"
		// };



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

		if (selectable && (this.state.hover || selected)) {
			divStyle.border = "solid #337AB7 2px";
		}
		if (selected) {
			fileNameStyle.backgroundColor = "rgba(51,122,183,0.8)";
			fileNameStyle.color = "White";
			anchorStyle.color = "White";
		}

		let deleteButton;
		let proof_tag_select_box;
		let option_tag_list = [];
		if (this.props.user == "auditor") {
			for (let p of this.props.proof_tags) {
				if (p.section_id === this.props.section_id) {
					option_tag_list.push(<option key={p.id} value={p.id}>{p.proof_tag}</option>);
				}
			}
		}
		else {
			for (let p of this.props.proof_tags) {
				option_tag_list.push(<option key={p.id} value={p.id}>{p.proof_tag}</option>);
			}
		}

		if (this.props.deletable && this.props.onDelete) {
			deleteButton = (
				<button className="btn btn-default btn-sm pull-right" onClick={this.showDeleteModal} title="Delete Attachment">
					<Cross />
				</button>
			);
			if (option_tag_list.length > 0) {
				let proof_tag_select_box_value;
				if (this.props.attachment.proof_tag) {
					proof_tag_select_box_value = this.props.attachment.proof_tag;
					proof_tag_select_box_style = {
						fontSize: "12px",
						width: "145px",
						height: "30px",
						backgroundColor: "#DFF0D8",
					};
				}
				else {
					proof_tag_select_box_value = "";
					proof_tag_select_box_style = {
						fontSize: "12px",
						width: "145px",
						height: "30px",
						backgroundColor: "#F2DEDE",
						border: "1px solid #ed0c0c",
					};
				}
				proof_tag_select_box = (<select className="form-control form-control-sm" value={proof_tag_select_box_value} style={proof_tag_select_box_style} onChange={this.props.onChange}>
					<option value="">Select Tag</option>
					{option_tag_list}
				</select>);
			}
		}

		// ------------------------------------

		let imageSrc;
		switch (a.proof_type) {
		case "PHOTO":
			if (this.state.loading) {
				imageSrc = loadingImageUrl;
				divStyle.backgroundSize = "30px 30px";
			} else if (this.state.error) {
				imageSrc = attachmentErrorImgUrl;
				divStyle.backgroundSize = "30px 30px";
			} else {
				imageSrc = a.extra.thumbnail_url;
			}
			break;
		case "AUDIO":
			imageSrc = attachmentMicrophoneImgUrl;
			divStyle.backgroundSize = "30px 30px";
			break;
		case "VIDEO":
			imageSrc = attachmentFilmImgUrl;
			divStyle.backgroundSize = "30px 30px";
			break;
		case "OTHER":
			imageSrc = attachmentFileImgUrl;
			divStyle.backgroundSize = "30px 30px";
			break;
		}
		divStyle.backgroundImage = `url("${imageSrc}")`;

		return (
			<div
				style={{
					display: "inline-block",
					width: "150px",
					height: "100px",
					margin: "5px",
				}}
			>
				<div
					style={divStyle}
					title={a.file_name}
					onClick={this.showModal}
					onMouseEnter={this.onMouseEnter}
					onMouseLeave={this.onMouseLeave}
				>
					{deleteButton}
					<div style={fileNameStyle} onClick={(e) => e.stopPropagation()}>
						<AttachmentProofIcon proofType={a.proof_type} />
						&nbsp;
						<a href={a.direct_url} style={anchorStyle}>
							{a.file_name}
						</a>
						<br />
					</div>
					<img
						className="hidden"
						src={imageSrc}
						onLoad={this.onImageLoad}
						onError={this.onImageError}
					/>
				</div>
				<div style={{ marginLeft: "5px", marginBottom: "10px" }}>
					{proof_tag_select_box}
				</div>
				<div className="modal" tabIndex="-1" style={modalStyle}>
					<div className="modal-backdrop fade in" style={modalBackdropStyle} onClick={this.hideDeleteModal} />
					<div className="modal-dialog" style={modalDialogStyle}>
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" onClick={this.hideDeleteModal}>&times;</button>
								<h4 className="modal-title">Delete Attachment</h4>
							</div>
							<div className="modal-body">
								Are you sure you want to delete <b>{this.props.attachment.file_name}</b> attachment ?
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-default" onClick={this.delete_hideModal}>Yes</button>
								<button type="button" className="btn btn-default" onClick={this.hideDeleteModal}>No</button>
							</div>
						</div>
					</div>
				</div>
				{this.state.showModal && (
					<MandatoryAttachmentBiggerModal
						attachment={a}
						onClose={this.hideModal}
					/>
				)}
			</div>
		);
	}
}
