import React from "react";
import PropTypes from "prop-types";

import NavLink from "../../components/NavLink.jsx";

export default class ShopperGuide extends React.Component{
	static propTypes = {
		children: PropTypes.node,
	};
	render(){
		return (<div>
			<ul className="nav nav-tabs">
				<NavLink to="/shopper_guide/videos"><b>Expert Videos</b></NavLink>
				<NavLink to="/shopper_guide/blog"><b>Shopper Blogs</b></NavLink>
				<NavLink to="/shopper_guide/podcast"><b>Audio Podcast</b></NavLink>
				<NavLink to="/shopper_guide/social_snippets"><b>Connect With Us</b></NavLink>
			</ul>
			<br/>
			{this.props.children}
		</div>);
	}
}
