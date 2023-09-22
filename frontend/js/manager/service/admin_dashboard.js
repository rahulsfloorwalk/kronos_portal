import $ from "jquery";
import { url } from "../../../config.js";

export function findCategories(){
	return $.get( url.api_base_path + "manager/category");
}

export function findCategoryById(categoryId){
	return $.get( url.api_base_path + `manager/category/${categoryId}`);
}

export function addCategory(category){
	return $.ajax({
		url: url.api_base_path + "manager/category",
		method: "POST",
		data: JSON.stringify(category),
		contentType: "application/json"
	});
}

export function updateCategory(categoryId,category ){
	return $.ajax({
		url: url.api_base_path + `manager/category/${categoryId}`,
		method: "POST",
		data: JSON.stringify(category),
		contentType: "application/json"
	});
}

export function deleteCategory(categoryId){
	return $.ajax({
		url: url.api_base_path + `manager/category/${categoryId}`,
		type: "DELETE",
	});
}
//--------------------------------------------------------------------------------

export function findAttachmentsByCategory(categoryId){
	return $.get(url.api_base_path + `manager/category/${categoryId}/attachment`);

}
export function completeCategoryAttachment(attachmentId,categoryId){
	return $.ajax({
		url: url.api_base_path + `manager/category_attachment/${attachmentId}/complete`,
		type: "POST",
		data: JSON.stringify(categoryId),
		contentType: "application/json"
	});
}
export function doCategoryAttachmentUpload(url, file,categoryId){
	let mainPromise = $.Deferred();

	let payload = {
		"file_name": file.name,
		"file_size": file.size,
		"file_type": file.type
	};

	mainPromise.notify("INIT");
	let req = $.ajax({
		type: "POST",
		url: url,
		data: JSON.stringify(payload),
		contentType: "application/json"
	});

	req.done(function(post_data){
		mainPromise.notify("STARTING_UPLOAD");

		var formData = new FormData();
		formData.append("x-amz-credential", post_data.fields["x-amz-credential"]);
		formData.append("x-amz-algorithm", post_data.fields["x-amz-algorithm"]);
		formData.append("x-amz-date", post_data.fields["x-amz-date"]);
		formData.append("x-amz-signature", post_data.fields["x-amz-signature"]);
		formData.append("acl", post_data.fields.acl);
		formData.append("policy", post_data.fields.policy);
		formData.append("key", post_data.fields.key);
		formData.append("success_action_status", "201");
		formData.append("file", file);

		$.ajax({
			url: post_data.url,
			type: "POST",
			data: formData,
			processData: false,
			contentType: false,
			xhr: function() {
				let myXhr = $.ajaxSettings.xhr();
				if(myXhr.upload){
					myXhr.upload.addEventListener("progress",function(e){
						if(e.lengthComputable){
							let max = e.total;
							let current = e.loaded;

							let percentage = (current * 100)/max;
							mainPromise.notify("UPLOAD_PROGRESS", percentage);
						}
					}, false);
				}
				return myXhr;
			},
		}).then(function(){
			completeCategoryAttachment(post_data.attachment.id,categoryId).then(function(){
				mainPromise.resolve();
			}, function(){
				mainPromise.reject("There was an error, please try again.");
			});
		}, function(){
			mainPromise.reject("There was an error, please try again.");
		});
	});

	req.fail(function(err){
		if(err && err.responseJSON && err.responseJSON.non_field_errors){
			mainPromise.reject(err.responseJSON.non_field_errors[0]);
		} else {
			mainPromise.reject("There was an error, please try again.");
		}
	});

	return mainPromise;
}
export function uploadFileForCategories(categoryId,file){
	var req_url = url.api_base_path + `manager/category/${categoryId}/attachment`;
	return doCategoryAttachmentUpload(req_url, file,categoryId);
}

export function deleteCategoryAttachment(attachmentId,categoryId){
	return $.ajax({
		url: url.api_base_path + `manager/category_attachment/${attachmentId}/delete`,
		type: "DELETE",
		data: JSON.stringify(categoryId),
		contentType: "application/json"
	});

}

// ---------------------------------------------------------------------------------------------------

export function findTaxes(){
	return $.get( url.api_base_path + "manager/tax");
}

export function findTaxById(taxId){
	return $.get( url.api_base_path + `manager/tax/${taxId}`);
}

export function addTax(name,rate){
	return $.ajax({
		url: url.api_base_path + "manager/tax",
		method: "POST",
		data: JSON.stringify({
			name,
			rate,
		}),
		contentType: "application/json"
	});
}

export function updateTax(taxId, name,rate){
	return $.ajax({
		url: url.api_base_path + `manager/tax/${taxId}`,
		method: "POST",
		data: JSON.stringify({
			name,
			rate,
		}),
		contentType: "application/json"
	});
}

export function deleteTax(taxId){
	return $.ajax({
		url: url.api_base_path + `manager/tax/${taxId}`,
		type: "DELETE"
	});
}

export function findIndustries(){
	return $.get( url.api_base_path + "manager/industry");
}

export function findIndustryById(industryId){
	return $.get( url.api_base_path + `manager/industry/${industryId}`);
}

export function addIndustry(name){
	return $.ajax({
		url: url.api_base_path + "manager/industry",
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function updateIndustry(industryId, name){
	return $.ajax({
		url: url.api_base_path + `manager/industry/${industryId}`,
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function deleteIndustry(industryId){
	return $.ajax({
		url: url.api_base_path + `manager/industry/${industryId}`,
		type: "DELETE"
	});
}

export function findInterestAreas(){
	return $.get( url.api_base_path + "manager/interested_area");
}

export function findInterestAreaById(interestareaId){
	return $.get( url.api_base_path + `manager/interested_area/${interestareaId}`);
}

export function addInterestArea(name){
	return $.ajax({
		url: url.api_base_path + "manager/interested_area",
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function updateInterestArea(interestareaId, name){
	return $.ajax({
		url: url.api_base_path + `manager/interested_area/${interestareaId}`,
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function deleteInterestArea(interestareaId){
	return $.ajax({
		url: url.api_base_path + `manager/interested_area/${interestareaId}`,
		type: "DELETE"
	});
}

export function findSolutions(){
	return $.get( url.api_base_path + "manager/solution");
}

export function findSolutionById(solutionId){
	return $.get( url.api_base_path + `manager/solution/${solutionId}`);
}

export function addSolution(solution){
	return $.ajax({
		url: url.api_base_path + "manager/solution",
		method: "POST",
		data: JSON.stringify(solution),
		contentType: "application/json"
	});
}

export function updateSolution(solutionId,solution){
	return $.ajax({
		url: url.api_base_path + `manager/solution/${solutionId}`,
		method: "POST",
		data: JSON.stringify(solution),
		contentType: "application/json"
	});
}


export function deleteSolution(solutionId){
	return $.ajax({
		url: url.api_base_path + `manager/solution/${solutionId}`,
		type: "DELETE"
	});
}
export function updateSolutionIsActive(solutionId, solution) {
	return $.ajax({
		url: url.api_base_path + `manager/solution_status/${solutionId}`,
		method: "POST",
		data: JSON.stringify(solution),
		contentType: "application/json",
	});
}
export function updateSolutionIsPopular(solutionId, solution) {
	return $.ajax({
		url: url.api_base_path + `manager/popular_status/${solutionId}`,
		method: "POST",
		data: JSON.stringify(solution),
		contentType: "application/json",
	});
}
export function updateSolutionIsShow(solutionId, solution) {
	return $.ajax({
		url: url.api_base_path + `manager/solution_show_status/${solutionId}`,
		method: "POST",
		data: JSON.stringify(solution),
		contentType: "application/json",
	});
}
export function findArchievedSolutions(){
	return $.get( url.api_base_path + "manager/solution_archieved");
}

//--------------------------------------------------------------------------------

export function findAttachmentsBySolution(solutionId){
	return $.get(url.api_base_path + `manager/solution/${solutionId}/attachment`);

}
export function completeAttachment(attachmentId,solutionId){
	return $.ajax({
		url: url.api_base_path + `manager/solution_attachment/${attachmentId}/complete`,
		type: "POST",
		data: JSON.stringify(solutionId),
		contentType: "application/json"
	});
}
export function doAttachmentUpload(url, file,solutionId){
	let mainPromise = $.Deferred();

	let payload = {
		"file_name": file.name,
		"file_size": file.size,
		"file_type": file.type
	};

	mainPromise.notify("INIT");
	let req = $.ajax({
		type: "POST",
		url: url,
		data: JSON.stringify(payload),
		contentType: "application/json"
	});

	req.done(function(post_data){
		mainPromise.notify("STARTING_UPLOAD");

		var formData = new FormData();
		formData.append("x-amz-credential", post_data.fields["x-amz-credential"]);
		formData.append("x-amz-algorithm", post_data.fields["x-amz-algorithm"]);
		formData.append("x-amz-date", post_data.fields["x-amz-date"]);
		formData.append("x-amz-signature", post_data.fields["x-amz-signature"]);
		formData.append("acl", post_data.fields.acl);
		formData.append("policy", post_data.fields.policy);
		formData.append("key", post_data.fields.key);
		formData.append("success_action_status", "201");
		formData.append("file", file);

		$.ajax({
			url: post_data.url,
			type: "POST",
			data: formData,
			processData: false,
			contentType: false,
			xhr: function() {
				let myXhr = $.ajaxSettings.xhr();
				if(myXhr.upload){
					myXhr.upload.addEventListener("progress",function(e){
						if(e.lengthComputable){
							let max = e.total;
							let current = e.loaded;

							let percentage = (current * 100)/max;
							mainPromise.notify("UPLOAD_PROGRESS", percentage);
						}
					}, false);
				}
				return myXhr;
			},
		}).then(function(){
			completeAttachment(post_data.attachment.id,solutionId).then(function(){
				mainPromise.resolve();
			}, function(){
				mainPromise.reject("There was an error, please try again.");
			});
		}, function(){
			mainPromise.reject("There was an error, please try again.");
		});
	});

	req.fail(function(err){
		if(err && err.responseJSON && err.responseJSON.non_field_errors){
			mainPromise.reject(err.responseJSON.non_field_errors[0]);
		} else {
			mainPromise.reject("There was an error, please try again.");
		}
	});

	return mainPromise;
}
export function uploadFileForSolutions(solutionId,file){
	var req_url = url.api_base_path + `manager/solution/${solutionId}/attachment`;
	return doAttachmentUpload(req_url, file,solutionId);
}

export function deleteAttachment(attachmentId,solutionId){
	return $.ajax({
		url: url.api_base_path + `manager/attachment/${attachmentId}/delete`,
		type: "DELETE",
		data: JSON.stringify(solutionId),
		contentType: "application/json"
	});

}

// ---------------------------------------------------------------------------------------------------

export function findQuestions(solutionId){
	return $.get( url.api_base_path + `manager/solution/${solutionId}/question`);
}
export function saveQuestion(data){
	return $.ajax({
		url : url.api_base_path + "manager/solution_question_add",
		method: "POST",
		data: JSON.stringify(data),
		contentType: "application/json"
	});
}
export function deleteQuestion(questionId){
	return $.ajax({
		url: url.api_base_path + `manager/solution_question/${questionId}`,
		type: "DELETE"
	});
}
export function findByQuestionId(questionId){
	return $.get( url.api_base_path + `manager/solution_question/${questionId}`);
}
export function updateQuestion(questionId,question){
	return $.ajax({
		url: url.api_base_path + `manager/solution_question/${questionId}`,
		method: "POST",
		data: JSON.stringify(question),
		contentType: "application/json"
	});
}

// -------------------------------------------------------------------------------

export function findDetailsbySolutionId(solutionId){
	return $.get( url.api_base_path + `manager/solution/${solutionId}/other_detail`);
}

export function saveDetails(details){
	return $.ajax({
		url: url.api_base_path + "manager/solution/other_details",
		method: "POST",
		data: JSON.stringify(details),
		contentType: "application/json"
	});
}
export function updateDetails(detailsId,details){
	return $.ajax({
		url: url.api_base_path + `manager/solution/${detailsId}/other_details`,
		method: "POST",
		data: JSON.stringify(details),
		contentType: "application/json"
	});
}
// -----------------------------------------------------------------------
export function findSolutionProofTag(solutionId){
	return $.get( url.api_base_path + `manager/solution/${solutionId}/solution_proof_tag`);
}

export function saveSolutionproofTag(solutionId, proof_tag_list){
	return $.ajax({
		url: url.api_base_path + `manager/solution/${solutionId}/solution_proof_tag`,
		method: "POST",
		data: JSON.stringify({
			proof_tag_list
		}),
		contentType: "application/json"
	});
}
export function findActiveCustomer(){
	return $.get(url.api_base_path+"manager/mp/active_customer");
}
export function findAllCount(){
	return $.get(url.api_base_path+"manager/mp_all_count");
}
