import React from "react";
import PropTypes from "prop-types";
import Loading from "./Loading.jsx";

export default class AmrAudioPlayer extends React.Component{
	static propTypes = {
		attachment: PropTypes.object,
		audioRef: PropTypes.func,
	};

	componentDidMount(){
		const el = document.createElement("script");
		el.src = "https://floorwalk-client-logos.s3.ap-south-1.amazonaws.com/extra/amrnb.js";
		el.id = "amrScriptId";
		el.async = true;
		el.attachment_url = this.props.attachment.direct_url;
		el.convertFunc = this.convertAmrFileToWav;
		document.head.appendChild(el);
		el.onload = function() {
			this.convertFunc(this.attachment_url);
		};
	}

	componentWillUnmount(){
		const el = document.getElementById("amrScriptId");
		if(el){
			el.remove();
		}
	}

	convertAmrFileToWav = (url) => {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.responseType = "blob";
		xhr.onload = function() {

			var reader = new FileReader();
			reader.onload = function(e) {
				var data = new Uint8Array(e.target.result);
				var buffer = window.AMR.toWAV(data);

				var url = URL.createObjectURL(new Blob([buffer], { type: "audio/x-wav" }));
				var audio = new Audio(url);
				audio.controls = true;
				audio.onloadedmetadata = audio.onerror = function() {
					URL.revokeObjectURL(url);
				};
				const amrPlayerLoader = document.getElementById("amr_player_loading");
				if(amrPlayerLoader){
					amrPlayerLoader.style.display = "none";
				}
				const amrPlayerNode = document.getElementById("audio_player_id");
				const source = document.createElement("source");
				source.src = url;
				source.type = "audio/x-wav";
				amrPlayerNode.appendChild(source);
				amrPlayerNode.load();
			};
			reader.readAsArrayBuffer(this.response);
		};
		xhr.onerror = function() {
			alert("Failed to fetch " + url);
		};
		xhr.send();
	};

	render(){
		return (
			<div>
				<audio id="audio_player_id" ref={this.props.audioRef} controls></audio>
				<div id="amr_player_loading" style={{display:"block"}}>
					<Loading loading_text="Please wait while loading AMR file"/>
				</div>
			</div>
		);
	}
}