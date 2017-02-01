import React from 'react';

export default React.createClass({
	getDefaultProps: function(){
		return {
			type: 'default'
		};
	},
	render : function(){
		var labelStyle = {
			fontSize: '100%'
		};
		return (
			<span className={`label label-${this.props.type}`} style={labelStyle}>
				{this.props.children}
			</span>
		);
	},
});
