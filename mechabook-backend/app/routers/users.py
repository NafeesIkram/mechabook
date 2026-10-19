from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserCreate,UserResponse,UserUpdate
router=APIRouter(prefix='/users',tags=['Users'])
@router.get('',response_model=list[UserResponse])
def get_users(db:Session=Depends(get_db)): return db.query(User).order_by(User.id.desc()).all()
@router.get('/{user_id}',response_model=UserResponse)
def get_user(user_id:int,db:Session=Depends(get_db)):
    u=db.query(User).filter(User.id==user_id).first()
    if not u: raise HTTPException(404,'User not found')
    return u
@router.post('',response_model=UserResponse,status_code=201)
def create_user(data:UserCreate,db:Session=Depends(get_db)):
    if db.query(User).filter(User.email==data.email).first(): raise HTTPException(400,'Email already exists')
    if db.query(User).filter(User.handle==data.handle).first(): raise HTTPException(400,'Handle already exists')
    u=User(name=data.name,handle=data.handle,email=data.email,password_hash=data.password); db.add(u); db.commit(); db.refresh(u); return u
@router.patch('/{user_id}',response_model=UserResponse)
def update_user(user_id:int,data:UserUpdate,db:Session=Depends(get_db)):
    u=db.query(User).filter(User.id==user_id).first()
    if not u: raise HTTPException(404,'User not found')
    for k,v in data.model_dump(exclude_unset=True).items(): setattr(u,k,v)
    db.commit(); db.refresh(u); return u
@router.delete('/{user_id}')
def delete_user(user_id:int,db:Session=Depends(get_db)):
    u=db.query(User).filter(User.id==user_id).first()
    if not u: raise HTTPException(404,'User not found')
    db.delete(u); db.commit(); return {'message':'User deleted successfully'}
