import React from 'react';

import Loading from './Loading.jsx';

export default class MarkdownViewer extends React.Component
{
	constructor(props){
		super(props);
		this.state = {
			loading: true
		};
	}

	componentDidMount(){
		import('marked').then((marked) => {
			this.marked = marked;
			this.setState({
				loading: false
			});
		}).catch((err) => console.warn("COULD NOT LOAD MARKED:", err));

	}

	render() {
		if(this.state.loading){
			return <Loading/>;
		} else {
			let markdown = {
				__html: this.marked(this.props.markdown || "")
			};
			return <div dangerouslySetInnerHTML={markdown } />;
		}
	}
}
