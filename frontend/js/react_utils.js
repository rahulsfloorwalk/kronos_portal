import { PaymentGSTAmount } from "./constants";

export function affectInputEventToComponent(e, component){
	var change = {};
	if( e.target.type !== "checkbox"){
		change[e.target.name] = e.target.value;
	} else if(e.target.type === "checkbox"){
		change[e.target.name] = e.target.checked;
	}
	component.setState(change);
	// console.log(e.target.name,"changed to", change);
}

export function getInputEventChangeValue(e){
	var change = {};
	if( e.target.type !== "checkbox"){
		change[e.target.name] = e.target.value;
	} else if(e.target.type === "checkbox"){
		change[e.target.name] = e.target.checked;
	}
	// console.log(e.target.name,"changed to", change);
	return change;
}

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
}

export function splitDateRange(date_range){
	if(date_range == ""){
		return ["", ""];
	}
	else{
		return date_range.split(" - ");
	}
}

export function findGSTForPayableAmount(payable_amount){
	if(payable_amount == ""){
		return 0;
	}
	else{
		let amount = Number(payable_amount) * (PaymentGSTAmount / 100);
		return amount.toFixed();
	}
}

export function getPayableAmountWithGST(payable_amount){

	if(payable_amount == ""){
		return Number(payable_amount);
	}
	else{
		payable_amount = parseFloat(Number(payable_amount));
		let amount = payable_amount + Number(findGSTForPayableAmount(payable_amount));
		return amount.toFixed();
	}
}