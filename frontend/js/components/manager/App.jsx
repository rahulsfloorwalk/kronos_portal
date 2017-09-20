import React from 'react';

import Header from './Header.jsx';
import Footer from '../Footer.jsx';
import DevelopmentMarker from '../DevelopmentMarker.jsx';

import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';

var App = React.createClass({
	render: function(){
		var contentStyle = {
			'minHeight': "600px"
		};
		return (
			<div>
				<DevelopmentMarker/>
				<Header/>
				<div className="container" style={contentStyle}>
					{this.props.children}
				</div>
				<Footer/>
				<Alert stack={{limit: 5}} effect="slide"/>
			</div>
		);
	},
});

export default App;
