// import React from "react";
// import PropTypes from "prop-types";
// import Loading from "./Loading.jsx";

// export default class AmrAudioPlayer extends React.Component{
// 	static propTypes = {
// 		attachment: PropTypes.object,
// 		audioRef: PropTypes.func,
// 	};

// 	componentDidMount(){
// 		const el = document.createElement("script");
// 		el.src = "https://floorwalk-client-logos.s3.ap-south-1.amazonaws.com/extra/amrnb.js";
// 		el.id = "amrScriptId";
// 		el.async = true;
// 		el.attachment_url = this.props.attachment.direct_url;
// 		el.convertFunc = this.convertAmrFileToWav;
// 		document.head.appendChild(el);
// 		el.onload = function() {
// 			this.convertFunc(this.attachment_url);
// 		};
// 	}

// 	componentWillUnmount(){
// 		const el = document.getElementById("amrScriptId");
// 		if(el){
// 			el.remove();
// 		}
// 	}

// 	convertAmrFileToWav = (url) => {
// 		var xhr = new XMLHttpRequest();
// 		xhr.open("GET", url);
// 		xhr.responseType = "blob";
// 		xhr.onload = function() {

// 			var reader = new FileReader();
// 			reader.onload = function(e) {
// 				var data = new Uint8Array(e.target.result);
// 				var buffer = window.AMR.toWAV(data);

// 				var url = URL.createObjectURL(new Blob([buffer], { type: "audio/x-wav" }));
// 				var audio = new Audio(url);
// 				audio.controls = true;
// 				audio.onloadedmetadata = audio.onerror = function() {
// 					URL.revokeObjectURL(url);
// 				};
// 				const amrPlayerLoader = document.getElementById("amr_player_loading");
// 				if(amrPlayerLoader){
// 					amrPlayerLoader.style.display = "none";
// 				}
// 				const amrPlayerNode = document.getElementById("audio_player_id");
// 				const source = document.createElement("source");
// 				source.src = url;
// 				source.type = "audio/x-wav";
// 				amrPlayerNode.appendChild(source);
// 				amrPlayerNode.load();
// 			};
// 			reader.readAsArrayBuffer(this.response);
// 		};
// 		xhr.onerror = function() {
// 			alert("Failed to fetch " + url);
// 		};
// 		xhr.send();
// 	};

// 	render(){
// 		return (
// 			<div>
// 				<audio id="audio_player_id" ref={this.props.audioRef} controls></audio>
// 				<div id="amr_player_loading" style={{display:"block"}}>
// 					<Loading loading_text="Please wait while loading AMR file"/>
// 				</div>
// 			</div>
// 		);
// 	}
// }



import React from "react";
import PropTypes from "prop-types";
import Loading from "./Loading.jsx";

export default class AmrAudioPlayer extends React.Component {
	static propTypes = {
		attachment: PropTypes.object.isRequired,
		audioRef: PropTypes.func,
	};

	constructor(props) {
		super(props);
		this.state = {
			wavUrl: null,
			loading: true,
			error: false
		};
	}

	componentDidMount() {
		var self = this;

		var script = document.createElement("script");
		script.src =
			"https://floorwalk-client-logos.s3.ap-south-1.amazonaws.com/extra/amrnb.js";
		script.id = "amrScriptId";
		script.async = true;

		script.onload = function () {
			self.convertAmrFileToWav(self.props.attachment.direct_url);
		};
		script.onerror = function () {
			console.error("Failed to load amrnb.js");
			self.setState({ error: true, loading: false });
		};

		document.head.appendChild(script);
	}

	componentWillUnmount() {
		var el = document.getElementById("amrScriptId");
		if (el) el.parentNode.removeChild(el);

		// Revoke blob URL on unmount
		if (this.state.wavUrl) {
			URL.revokeObjectURL(this.state.wavUrl);
		}
	}

	convertAmrFileToWav = function (url) {
		var self = this;

		var xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.responseType = "arraybuffer"; // use arraybuffer

		xhr.onload = function () {
			try {
				var data = new Uint8Array(xhr.response);
				var buffer = window.AMR.toWAV(data);
				var wavBlob = new Blob([buffer], { type: "audio/wav" });

				// Revoke previous URL if exists
				if (self.state.wavUrl) {
					URL.revokeObjectURL(self.state.wavUrl);
				}

				var wavUrl = URL.createObjectURL(wavBlob);

				self.setState({ wavUrl: wavUrl, loading: false });
			} catch (err) {
				console.error("AMR decoding failed:", err);
				self.setState({ error: true, loading: false });
			}
		};

		xhr.onerror = function () {
			console.error("Failed to fetch AMR file:", url);
			self.setState({ error: true, loading: false });
		};

		xhr.send();
	};

	render() {
		if (this.state.error) {
			return React.createElement("p", null, "Failed to load audio.");
		}

		if (this.state.loading) {
			return React.createElement(Loading, { loading_text: "Please wait while loading AMR file" });
		}

		return React.createElement("div", null,
			React.createElement("audio", {
				id: "audio_player_id",
				ref: this.props.audioRef,
				controls: true,
				src: this.state.wavUrl
			})
		);
	}
}