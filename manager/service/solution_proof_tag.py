from manager.models import ProofTag,MPSolutionProofTagList,MPSolution
from django.db.transaction import atomic
def get_solution_proof_tag(solution_id):
    proof_tag_obj = ProofTag.objects.filter(is_active=True)
    proof_tag_list=[]
    for i in proof_tag_obj:
        if MPSolutionProofTagList.objects.filter(proof_tag_id=i.id,solution_id=solution_id,is_active=True).exists():
            is_present_in_solution=True
        else:
            is_present_in_solution=False
        proof_tag_dict={}    
        proof_tag_dict['id']= i.id
        proof_tag_dict['name']= i.name
        proof_tag_dict['is_present_in_solution'] = is_present_in_solution
        proof_tag_dict['is_required']= False
        proof_tag_list.append(proof_tag_dict)    
        proof_tag_list = sorted(proof_tag_list, key=lambda j: j['name'])
    return sorted(proof_tag_list, key=lambda j: j['is_present_in_solution'], reverse=True)

@atomic
def save_proof_tag(solution_id,proof_tag_list):
    solution=MPSolution.objects.get(id=solution_id)
    for i in proof_tag_list:
        if MPSolutionProofTagList.objects.filter(solution_id=solution_id,proof_tag_id=i).exists():
            MPSolutionProofTagList.objects.filter(solution_id=solution_id, proof_tag_id=i).update(is_active=True)
        
        else:
            proof_tag_obj = ProofTag.objects.get(pk=i)
            solution_proof_tag_obj = MPSolutionProofTagList()
            solution_proof_tag_obj.solution = solution
            solution_proof_tag_obj.proof_tag = proof_tag_obj
            solution_proof_tag_obj.save()
    return solution