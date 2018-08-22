import React from 'react';

import Label from './Label.jsx';
import { getAuditStoreStatus } from '../utils.js';

export default class extends React.Component {
    render() {
		switch(this.props.rating){
			case 0:
				return <strong className="text-danger">Bad</strong>;
			case 1:
				return <strong className="text-warning">Average</strong>;
			case 2:
				return <strong className="text-success">Good</strong>;
			case null:
				return <span>not rated</span>;
			default:
				return <strong>unknown rating</strong>;
		}
	}
}
