import React from "react";

import { Record, Picture, Video, File } from "./Icons.jsx";

export default class extends React.Component {
    static defaultProps = {
    	proofType: "OTHER"
    };

    render() {
    	switch(this.props.proofType){
    	case "AUDIO":
    		return <Record/>;
    	case "PHOTO":
    		return <Picture/>;
    	case "VIDEO":
    		return <Video/>;
    	case "OTHER":
    	default:
    		return <File/>;
    	}
    }
}
