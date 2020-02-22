import React from "react";
import googleReviewImage from "../../../img/google_review.png";
import { Timeline } from "react-twitter-widgets";

export default class ShopperGuideSocialSnippets extends React.Component{
    render(){
        const margin_bottom = {
            marginBottom:"15px"
        };
        const main_div_style = {
            backgroundColor: "#f9f9f9",
            padding: "15px"
        };
		return (<div style={main_div_style}>
            {/* <h2 className="page-header">Mystery Shopping Talkies</h2> */}
            <div className="row" style={margin_bottom}>
                <div className="col-sm-6 col-md-6">
                    <h2 className="page-header">Like us on Facebook</h2>
                    <iframe src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FFloorWalk%2F&tabs=timeline&width=500&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId" width="100%"height="500" scrolling="no" frameBorder="0" allowTransparency="true"></iframe>
                </div>
                <div className="col-sm-6 col-md-6">
                <h2 className="page-header">Follow us on LinkedIn</h2>
                    <iframe src="https://www.linkedin.com/embed/feed/update/urn:li:share:6573094439659634688" height="500" width="100%" frameBorder="0" allowFullScreen="" title="Embedded post"></iframe>
                </div>
            </div>
            <div className="row" style={margin_bottom}>
                <div className="col-sm-6 col-md-6">
                    <h2 className="page-header">Tweet us on Twitter</h2>
                    <div>
                        <Timeline
                            dataSource={{
                            sourceType: "profile",
                            screenName: "FloorWalkIndia"
                            }}
                            options={{
                            username: "FloorWalkIndia",
                            height: "500"
                            }}
                        />
                    </div>
                </div>
                <div className="col-sm-6 col-md-6">
                <h2 className="page-header">Review us on Google</h2>
                    <a href="https://www.google.co.in/search?q=FloorWalk+Consultants+Pvt.+Ltd.,+L17,+A5,+3rd+Floor+Aashirwad+Properties,+DLF+Phase+2,+Gurugram,+Haryana+122002&ludocid=2002610103858639596#lkt=LocalPoiReviews&trex=m_t:lcl_akp,rc_f:,rc_ludocids:2002610103858639596,rc_q:FloorWalk%2520Consultants%2520Pvt.%2520Ltd.,ru_q:FloorWalk%2520Consultants%2520Pvt.%2520Ltd." target="__blank" ><img src={googleReviewImage} width="98%" /></a>

                </div>
            </div>
		</div>);
	}
}
