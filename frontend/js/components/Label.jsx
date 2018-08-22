import React from 'react';

export default class extends React.Component {
    static defaultProps = {
        type: 'default'
    };

    render() {
		var labelStyle = {
			fontSize: '100%'
		};
		return (
			<span className={`label label-${this.props.type}`} style={labelStyle}>
				{this.props.children}
			</span>
		);
	}
}
