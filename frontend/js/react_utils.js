
export function affectInputEventToComponent(e, component){
	var change = {};
	if( e.target.type !== "checkbox"){
		change[e.target.name] = e.target.value;
	} else if(e.target.type === "checkbox"){
		change[e.target.name] = e.target.checked;
	}
	component.setState(change);
	console.log(e.target.name,"changed to", change);
};

export function getInputEventChangeValue(e){
	var change = {};
	if( e.target.type !== "checkbox"){
		change[e.target.name] = e.target.value;
	} else if(e.target.type === "checkbox"){
		change[e.target.name] = e.target.checked;
	}
	console.log(e.target.name,"changed to", change);
	return change;
};

export function orderKeys(o, f) {
	var os=[], ks=[], i;
	for (i in o) {
		os.push([i, o[i]]);
	}
	os.sort(function(a,b){return f(a[1],b[1]);});
	for (i=0; i<os.length; i++) {
		ks.push(os[i][0]);
	}
	return ks;
};
