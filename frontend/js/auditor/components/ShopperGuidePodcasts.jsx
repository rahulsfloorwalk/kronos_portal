import React from "react";
import Loading from "../../components/Loading.jsx";

export default class ShopperGuidePodcasts extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			loading: true
		};
	}
	componentDidMount(){
		this.timeoutHandle = setTimeout(()=>{
			this.setState({loading:false});
		}, 2000);
	}

	componentWillUnmount(){
		clearTimeout(this.timeoutHandle);
	}
	render(){
		const margin_bottom = {
			marginBottom:"15px"
		};
		const main_div_style = {
			backgroundColor: "#f9f9f9",
			padding: "15px"
		};
		if(this.state.loading){
			return(<Loading/>);
		}
		return (<div style={main_div_style}>
			<h2 className="page-header">The Mystery Shopping Podcast</h2>
			<div className="row" style={margin_bottom}>
				<div className="col-sm-6 col-md-6">
					<iframe src="https://anchor.fm/mystery-shopping-talkies/embed/episodes/Episode-01---Mystery-Shopping--Its-Benefits-e9isdc/a-a16el2i" height="102px" width="98%" frameBorder="0" scrolling="no"></iframe>
				</div>
				<div className="col-sm-6 col-md-6">
					<iframe src="https://anchor.fm/mystery-shopping-talkies/embed/episodes/Episode-02---Types-of-Mystery-Shopping--Eligibility-to-Become-a-Mystery-Shopper-e9jk3i/a-a16f4kc" height="102px" width="98%" frameBorder="0" scrolling="no"></iframe>
				</div>
			</div>
			<div className="row" style={margin_bottom}>
				<div className="col-sm-6 col-md-6">
					<iframe src="https://anchor.fm/mystery-shopping-talkies/embed/episodes/Episode-03---Things-to-Consider-Before-Registering-as-a-Mystery-Shopper-e9jmha/a-a16g5ka" height="102px" width="98%" frameBorder="0" scrolling="no"></iframe>
				</div>
				<div className="col-sm-6 col-md-6">
					<iframe src="https://anchor.fm/mystery-shopping-talkies/embed/episodes/Episode-04---Things-to-Check-before-Registering-with-Any-Mystery-Shopping-Company-e9jmlq/a-a16f3cg" height="102px" width="98%" frameBorder="0" scrolling="no"></iframe>
				</div>
			</div>
			<div className="row" style={margin_bottom}>
				<div className="col-sm-6 col-md-6">
					<iframe src="https://anchor.fm/mystery-shopping-talkies/embed/episodes/Episode-05----Meet-the-Shopper----Christina-e9kfhd/a-a16qiej" height="102px" width="98%" frameBorder="0" scrolling="no"></iframe>
				</div>
				<div className="col-sm-6 col-md-6">
					<iframe src="https://anchor.fm/mystery-shopping-talkies/embed/episodes/Episode-06----Meet-The-Shopper----Megha-e9kme9/a-a16mhbk" height="102px" width="98%" frameBorder="0" scrolling="no"></iframe>
				</div>
			</div>
			<div className="row" style={margin_bottom}>
				<div className="col-sm-6 col-md-6">
					<iframe src="https://anchor.fm/mystery-shopping-talkies/embed/episodes/Episode-07----Meet-the-Shopper----Sayli-e9l1n1/a-a16mhbk" height="102px" width="98%" frameBorder="0" scrolling="no"></iframe>
				</div>
				<div className="col-sm-6 col-md-6">
					<iframe src="https://anchor.fm/mystery-shopping-talkies/embed/episodes/Episode-08----Meet-the-Shopper----Tirthankar-e9l4g9/a-a16mhbk" height="102px" width="98%" frameBorder="0" scrolling="no"></iframe>
				</div>
			</div>
			<div className="row" style={margin_bottom}>
				<div className="col-sm-6 col-md-6">
					<iframe src="https://anchor.fm/mystery-shopping-talkies/embed/episodes/Episode-09----Meet-the-Shopper----Paresh-e9l4p0/a-a16mhbk" height="102px" width="98%" frameBorder="0" scrolling="no"></iframe>
				</div>
				<div className="col-sm-6 col-md-6">
					<iframe src="https://anchor.fm/mystery-shopping-talkies/embed/episodes/Episode-10----Meet-the-Shopper----Sadhna-e9l4pe/a-a16mhbk" height="102px" width="98%" frameBorder="0" scrolling="no"></iframe>
				</div>
			</div>
		</div>);
	}
}
