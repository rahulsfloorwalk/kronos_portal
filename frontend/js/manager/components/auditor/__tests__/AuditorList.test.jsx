import React from "react";
import { AuditorList } from "../AuditorList";
import { AuditorRow } from "../AuditorList";
import { searchAuditors } from "../../../service/auditor";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";
import $ from "jquery";

jest.mock("../../../service/auditor.js");

const sampleResults = {
	"results": [
		{
			"additionalinfo":{
				"camera_owned": null,
				"camera_resoulution": 4,
				"car_cost": 500000,
				"car_model": "Maruti",
				"company": "ABC",
				"distance": 10,
				"hair_color": null,
				"has_car": true,
				"height": null,
				"id": 1,
				"industry": "It",
				"is_complete": true,
				"laptop_model": "DELL",
				"laptop_owned": true,
				"mobile_model": "Iphone",
				"occupation": "SERVICE",
				"income": "2",
				"referral_code": "john7890",
				"referred_by": "",
				"smart_phone_owned": null,
				"user_id": 4,
				"weekend_audit": null,
				"weight": null
			},
			"id": 7552,
			"username": "abcdef@gmail.com",
			"email": "abcdef@gmail.com",
			"is_active": true,
			"date_joined": "2018-07-05T08:45:22.553432Z",
			"last_login": "2018-07-14T13:13:06.995054Z",
			"profileinfo": {
				"id": 7338,
				"first_name": "Asdfgh",
				"last_name": "Hgfdsa",
				"gender": "F",
				"marital_status": "M",
				"education": "PG",
				"mobile_number": "0987654321",
				"date_of_birth": "1979-11-20",
				"address": "518/b Congress Nagar",
				"pincode": "440012",
				"city": {
					"id": 1,
					"name": "Nagpur",
					"state": "IN-MH",
					"state_name": "Maharashtra",
					"lat": "21.145800",
					"lon": "79.088155",
					"gmaps_url": "http://maps.google.com/maps/place/Nagpur/@21.145800,79.088155,12z"
				},
				"user_id": 7552,
				"is_complete": true,
				"average_rating": 1.667,
			},
			"verification": {
				"id": 7356,
				"key_expires": "2018-07-07T08:45:22.630840Z",
				"is_verified": true,
				"user_id": 7552
			}
		},
		{
			"additionalinfo":{
				"camera_owned": null,
				"camera_resoulution": null,
				"car_cost": null,
				"car_model": null,
				"company": null,
				"distance": null,
				"hair_color": null,
				"has_car": true,
				"height": null,
				"id": 1,
				"industry": null,
				"is_complete": false,
				"laptop_model": null,
				"laptop_owned": true,
				"mobile_model": null,
				"occupation": null,
				"income": null,
				"referral_code": null,
				"referred_by": "",
				"smart_phone_owned": null,
				"user_id": 4,
				"weekend_audit": null,
				"weight": null
			},
			"id": 1709,
			"username": "abc@gmail.com",
			"email": "abc@gmail.com",
			"is_active": true,
			"date_joined": "2016-12-14T11:34:29.305109Z",
			"last_login": "2016-12-14T11:39:28.612415Z",
			"profileinfo": {
				"id": 1520,
				"first_name": "Abc",
				"last_name": "Def",
				"gender": "M",
				"marital_status": "S",
				"education": "GR",
				"mobile_number": "1234567890",
				"date_of_birth": "1990-06-10",
				"address": "119,bajiprabhunagar,Nagpur",
				"pincode": "440033",
				"city": {
					"id": 1,
					"name": "Nagpur",
					"state": "IN-MH",
					"state_name": "Maharashtra",
					"lat": "21.145800",
					"lon": "79.088155",
					"gmaps_url": "http://maps.google.com/maps/place/Nagpur/@21.145800,79.088155,12z"
				},
				"user_id": 1709,
				"is_complete": true,
				"average_rating": null,
			},
			"verification": {
				"id": 1700,
				"key_expires": "2016-12-16T11:34:29Z",
				"is_verified": true,
				"user_id": 1709
			}
		},
		{
			"additionalinfo":{
				"camera_owned": null,
				"camera_resoulution": null,
				"car_cost": null,
				"car_model": null,
				"company": null,
				"distance": null,
				"hair_color": null,
				"has_car": true,
				"height": null,
				"id": 1,
				"industry": null,
				"is_complete": false,
				"laptop_model": null,
				"laptop_owned": true,
				"mobile_model": null,
				"occupation": null,
				"income": null,
				"referral_code": null,
				"referred_by": "",
				"smart_phone_owned": null,
				"user_id": 4,
				"weekend_audit": null,
				"weight": null
			},
			"id": 1710,
			"username": "abdc@gmail.com",
			"email": "abcd@gmail.com",
			"is_active": true,
			"date_joined": "2016-12-14T11:34:29.305109Z",
			"last_login": "2016-12-14T11:39:28.612415Z",
			"profileinfo": {
				"id": 1520,
				"first_name": "Abc",
				"last_name": "Def",
				"gender": "M",
				"marital_status": "S",
				"education": "GR",
				"mobile_number": "1234567890",
				"date_of_birth": "1990-06-10",
				"address": "119,bajiprabhunagar,Nagpur",
				"pincode": "440033",
				"city": null,
				"user_id": 1710,
				"is_complete": true,
				"average_rating": null,
			},
			"verification": {
				"id": 1700,
				"key_expires": "2016-12-16T11:34:29Z",
				"is_verified": true,
				"user_id": 1709
			}
		}
	]
};

describe("<AuditorRow/>", () => {

	it("renders the list of auditors correctly", (done) => {
		const r = renderer.create(<AuditorRow auditor={sampleResults["results"][0]}/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
});

describe("<AuditorList />", () => {
	let dispatch;
	beforeEach(() => {
		dispatch = jest.fn();
	});

	it("passes loading to false by default", () => {
		const r = shallow(<AuditorList dispatch={dispatch}/>);
		expect(r.state("loading")).toEqual(false);
	});

	it(" renders jumbotron by default", () => {
		const r = renderer.create(<AuditorList dispatch={dispatch}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("it calls prevent default when form is submitted", () => {
		const promise = $.Deferred();
		searchAuditors.mockReturnValue(promise);
		promise.resolve(sampleResults);
		const preventDefault = jest.fn();
		const dispatch = jest.fn();
		const r = shallow(<AuditorList dispatch={dispatch}/>);
		r.find("input").simulate("change", {
			target: {
				value: "a"
			}
		});
		r.find("form").simulate("submit", {
			preventDefault
		});
		expect(preventDefault).toBeCalled();
	});

	it("calls search auditor with search text", () => {
		const promise = $.Deferred();
		searchAuditors.mockReturnValue(promise);
		promise.resolve(sampleResults);
		const preventDefault = jest.fn();
		const dispatch = jest.fn();
		const r = shallow(<AuditorList dispatch={dispatch}/>);
		r.find("input").simulate("change", {
			target: {
				value: "a",
				name: "search",
			}
		});
		r.find("form").simulate("submit", {
			preventDefault
		});
		expect(searchAuditors).toBeCalledWith("a","","","","","","","","");
	});

	it("renders rows based on search result", (done) => {
		const promise = $.Deferred();
		searchAuditors.mockReturnValue(promise);
		promise.resolve(sampleResults);
		const preventDefault = jest.fn();
		const dispatch = jest.fn();
		const r = shallow(<AuditorList dispatch={dispatch}/>);
		r.find("input").simulate("change", {
			target: {
				value: "a"
			}
		});
		r.find("form").simulate("submit", {
			preventDefault
		});
		setTimeout(() =>{
			expect(r.find("AuditorRow")).toHaveLength(3);
			done();
		});

	});
});
