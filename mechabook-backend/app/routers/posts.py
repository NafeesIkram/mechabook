from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Post
from ..schemas import PostCreate,PostResponse
router=APIRouter(prefix='/posts',tags=['Posts'])
@router.get('',response_model=list[PostResponse])
def get_posts(db:Session=Depends(get_db)): return db.query(Post).order_by(Post.id.desc()).all()
@router.post('',response_model=PostResponse,status_code=201)
def create_post(data:PostCreate,db:Session=Depends(get_db)):
    p=Post(**data.model_dump()); db.add(p); db.commit(); db.refresh(p); return p
@router.delete('/{post_id}')
def delete_post(post_id:int,db:Session=Depends(get_db)):
    p=db.query(Post).filter(Post.id==post_id).first()
    if not p: raise HTTPException(404,'Post not found')
    db.delete(p); db.commit(); return {'message':'Post deleted successfully'}
