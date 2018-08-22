import React from 'react';

export default class extends React.Component {
    static defaultProps = {
        align: 'center',
        heading: '',
        para: ''
    };

    render() {
		return (
			<div className="form-group">
			<div className={`jumbotron text-${this.props.align}`}>
				<h3>{this.props.heading}</h3>
				<p>{this.props.para}</p>
			</div>
			</div>
		);
	}
}
