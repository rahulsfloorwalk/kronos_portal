
export function affectInputEventToComponent(e, component){
	var change = {};
	if( e.target.type !== "checkbox"){
		change[e.target.name] = e.target.value;
	} else if(e.target.type === "checkbox"){
		change[e.target.name] = e.target.checked;
	}
	component.setState(change);
	console.debug(e.target.name,"changed to", change);
};

export function getInputEventChangeValue(e){
	var change = {};
	if( e.target.type !== "checkbox"){
		change[e.target.name] = e.target.value;
	} else if(e.target.type === "checkbox"){
		change[e.target.name] = e.target.checked;
	}
	console.debug(e.target.name,"changed to", change);
	return change;
};
