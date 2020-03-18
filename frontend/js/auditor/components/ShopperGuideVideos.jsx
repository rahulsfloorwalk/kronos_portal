import React from "react";
import YouTube from "react-youtube";
import Loading from "../../components/Loading.jsx";

export default class ShopperGuideVideos extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			player: [],
			loading: true
		};
		this._onReady=this._onReady.bind(this);
		this.PlayVideo=this.PlayVideo.bind(this);
	}

	componentDidMount(){
		this.timeoutHandle = setTimeout(()=>{
			this.setState({loading:false});
		}, 2000);
	}

	componentWillUnmount(){
		clearTimeout(this.timeoutHandle);
	}

	_onReady(event) {
		const player = this.state.player;
		player.push(event.target);
		this.setState({
			player: player
		});
	}
	PlayVideo(event) {
		for (let i = 0; i < this.state.player.length; i++) {
			if(this.state.player[i] != event.target){
				this.state.player[i].pauseVideo();
			}
		}
	}
	render(){
		const margin_bottom = {
			marginBottom:"15px"
		};
		const opts = {
			height: "250",
			width: "98%",
		};
		const main_div_style = {
			backgroundColor: "#f9f9f9",
			padding: "15px"
		};
		if(this.state.loading){
			return(<Loading/>);
		}
		return (<div style={main_div_style}>
			<h2 className="page-header">How to work with us</h2>
			<div className="row" style={margin_bottom}>
				<div className="col-sm-6 col-md-6">
					<h4 className="page-header" style={{paddingBottom: "5px",margin: "5px 0 5px"}}>Episode 1 : Steps to register as a Mystery Shopper with FloorWalk</h4>
					<YouTube
						videoId="MU1AI1xnNcw"
						opts={opts}
						onReady={this._onReady}
						onPlay={this.PlayVideo}
					/>
				</div>
				<div className="col-sm-6 col-md-6">
					<h4 className="page-header" style={{paddingBottom: "5px",margin: "5px 0 5px"}}>Episode 2 : Shopper Profile Updation Tutorial.</h4>
					<YouTube
						videoId="8wkB_ij3cuk"
						opts={opts}
						onReady={this._onReady}
						onPlay={this.PlayVideo}
					/>
				</div>
			</div>
			<div className="row" style={margin_bottom}>
				<div className="col-sm-6 col-md-6">
					<h4 className="page-header" style={{paddingBottom: "5px",margin: "5px 0 5px"}}>Episode 3 : Shopper Application and Report Filling Tutorial .</h4>
					<YouTube
						videoId="HGPhwlNEkWI"
						opts={opts}
						onReady={this._onReady}
						onPlay={this.PlayVideo}
					/>
				</div>
				<div className="col-sm-6 col-md-6">
					<h4 className="page-header" style={{paddingBottom: "5px",margin: "5px 0 5px"}}>Episode 4 : Shoppers Payment Process Tutorial.</h4>
					<YouTube
						videoId="S8QmQCsFY0Q"
						opts={opts}
						onReady={this._onReady}
						onPlay={this.PlayVideo}
					/>
				</div>
			</div>
			<h2 className="page-header">Hear from the experts</h2>
			<div className="row" style={margin_bottom}>
				<div className="col-sm-6 col-md-6">
					<h4 className="page-header" style={{paddingBottom: "5px",margin: "5px 0 5px"}}>Episode 01 - Mystery Shopping & Its Benefits</h4>
					<YouTube
						videoId="kVdSoro0aQ4"
						opts={opts}
						onReady={this._onReady}
						onPlay={this.PlayVideo}
					/>
				</div>
				<div className="col-sm-6 col-md-6">
					<h4 className="page-header" style={{paddingBottom: "5px",margin: "5px 0 5px"}}>Episode 2 - Types of Mystery Shopping & Eligibility to become a Mystery Shopper</h4>
					<YouTube
						videoId="8wy-oxLHidI"
						opts={opts}
						onReady={this._onReady}
						onPlay={this.PlayVideo}
					/>
				</div>
			</div>
			<div className="row" style={margin_bottom}>
				<div className="col-sm-6 col-md-6">
					<h4 className="page-header" style={{paddingBottom: "5px",margin: "5px 0 5px"}}>Episode 3 - Things to be considered while registering with mystery shopping companies</h4>
					<YouTube
						videoId="4I0DaKr4Oag"
						opts={opts}
						onReady={this._onReady}
						onPlay={this.PlayVideo}
					/>
				</div>
				<div className="col-sm-6 col-md-6">
					<h4 className="page-header" style={{paddingBottom: "5px",margin: "5px 0 5px"}}>Episode 4 - Things to check before registering with any Mystery Shopping Company</h4>
					<YouTube
						videoId="CAN__EblyiY"
						opts={opts}
						onReady={this._onReady}
						onPlay={this.PlayVideo}
					/>
				</div>
			</div>

			<h2 className="page-header">Meet FloorWalk Shoppers</h2>
			<div className="row" style={margin_bottom}>
				<div className="col-sm-6 col-md-6">
					<h4 className="page-header" style={{paddingBottom: "5px",margin: "5px 0 5px"}}>## Meet the Shopper ## - Christina</h4>
					<YouTube
						videoId="32kwao9-png"
						opts={opts}
						onReady={this._onReady}
						onPlay={this.PlayVideo}
					/>
				</div>
				<div className="col-sm-6 col-md-6">
					<h4 className="page-header" style={{paddingBottom: "5px",margin: "5px 0 5px"}}>## Meet the Shopper ## - Tirthankar</h4>
					<YouTube
						videoId="DbeYELJdGNE"
						opts={opts}
						onReady={this._onReady}
						onPlay={this.PlayVideo}
					/>
				</div>
			</div>
			<div className="row" style={margin_bottom}>
				<div className="col-sm-6 col-md-6">
					<h4 className="page-header" style={{paddingBottom: "5px",margin: "5px 0 5px"}}>## Meet The Shopper ## - Megha</h4>
					<YouTube
						videoId="2Gm8j5dF3lk"
						opts={opts}
						onReady={this._onReady}
						onPlay={this.PlayVideo}
					/>
				</div>
				<div className="col-sm-6 col-md-6">
					<h4 className="page-header" style={{paddingBottom: "5px",margin: "5px 0 5px"}}>## Meet the Shopper ## - Sadhna</h4>
					<YouTube
						videoId="OeeagqhSSqM"
						opts={opts}
						onReady={this._onReady}
						onPlay={this.PlayVideo}
					/>
				</div>
			</div>
			<div className="row" style={margin_bottom}>
				<div className="col-sm-6 col-md-6">
					<h4 className="page-header" style={{paddingBottom: "5px",margin: "5px 0 5px"}}>## Meet the Shopper ## - Sayli</h4>
					<YouTube
						videoId="bY_NezD9Jm4"
						opts={opts}
						onReady={this._onReady}
						onPlay={this.PlayVideo}
					/>
				</div>
				<div className="col-sm-6 col-md-6">
					<h4 className="page-header" style={{paddingBottom: "5px",margin: "5px 0 5px"}}>## Meet the Shopper ## - Paresh</h4>
					<YouTube
						videoId="8qg6eDzncJw"
						opts={opts}
						onReady={this._onReady}
						onPlay={this.PlayVideo}
					/>
				</div>
			</div>
		</div>);
	}
}
