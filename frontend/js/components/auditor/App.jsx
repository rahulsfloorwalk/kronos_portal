import React from 'react';

import Header from './Header.jsx';
import Footer from '../Footer.jsx';
import DevelopmentMarker from '../DevelopmentMarker.jsx';

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
			</div>
		);
	},
});

export default App;
