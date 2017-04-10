import React from 'react';

import { Record, Picture, Video, File } from './Icons.jsx';

export default React.createClass({
	getDefaultProps: function(){
		return {
			proofType: "OTHER"
		};
	},
	render : function(){
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
});
