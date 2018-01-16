import React from 'react';

var Footer = React.createClass({
	getDefaultProps: function(){
		return {
			config: {},
		};
	},
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
					<a href={this.props.config.RHEA_BASE_URL}>{ this.props.config.RHEA_DOMAIN }</a> 
					&nbsp;|&nbsp;
					<a href={"mailto:"+ this.props.config.SUPPORT_EMAIL }>{this.props.config.SUPPORT_EMAIL}</a> 
					&nbsp;|&nbsp;
					<a href={"tel:"+ this.props.config.SUPPORT_PHONE }>{ this.props.config.SUPPORT_PHONE }</a> 
					&nbsp;|&nbsp;
					<a href={ this.props.config.TW_PAGE_URL }>@{ this.props.config.TW_USERNAME }</a>
					&nbsp;|&nbsp;
					v{this.props.config.PHOEBE_VERSION}
				</p>
				<p className="text-center text-muted small">
					{this.props.config.BRAND_NAME} &copy; 2014 to Present
				</p>
			</div>
		);
	},
});

export default Footer;
