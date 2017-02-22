import React from 'react';

var Footer = React.createClass({
	render: function(){
		var brandStyle = {
			height:"30px"
		};
		return (
			<div className="col-xs-12">
				<hr/>
				<p className="text-center">
					<img style={brandStyle} src="/static/img/logo_3_500x100.png"/>
				</p>
				<p className="text-center text-muted small">
					Floorwalk Consultants Pvt. Ltd. &copy; 2016
				</p>
				<p className="text-center text-muted small">
					<a href="http://floorwalk.in">floorwalk.in</a> |
					<a href="mailto:contactus@floorwalk.in">contactus@floorwalk.in</a> |
					<a href="tel:+91-8496003316">+91-8496003316</a> |
					<a href="https://twitter.com/FloorWalkIndia">@FloorWalkIndia</a>
				</p>
			</div>
		);
	},
});

export default Footer;
