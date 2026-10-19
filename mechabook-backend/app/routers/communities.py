from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Community
from ..schemas import CommunityCreate,CommunityResponse
router=APIRouter(prefix='/communities',tags=['Communities'])
@router.get('',response_model=list[CommunityResponse])
def get_communities(db:Session=Depends(get_db)): return db.query(Community).order_by(Community.id.desc()).all()
@router.post('',response_model=CommunityResponse,status_code=201)
def create_community(data:CommunityCreate,db:Session=Depends(get_db)):
    x=Community(owner_id=data.owner_id,name=data.name,description=data.description,category=data.category,max_members=data.max_members,is_private=data.is_private,members=1); db.add(x); db.commit(); db.refresh(x); return x
@router.delete('/{community_id}')
def delete_community(community_id:int,db:Session=Depends(get_db)):
    x=db.query(Community).filter(Community.id==community_id).first()
    if not x: raise HTTPException(404,'Community not found')
    db.delete(x); db.commit(); return {'message':'Community deleted successfully'}
