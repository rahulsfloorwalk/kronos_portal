import React from 'react';

import Header from './Header.jsx';
import Footer from '../Footer.jsx';

var App = React.createClass({
	render: function(){
		var contentStyle = {
			'minHeight': "600px"
		};
		return (
			<div>
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
