from fastapi import Request
from pydantic import Field

from contextlib import asynccontextmanager
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


from config import settings
from database import Product, BasketItem, create_tables, get_db



# =========================
# Pydantic Schemas
# =========================

class BasketItemRequest(BaseModel):
    product_id: int = Field(..., description="Product ID")
    quantity: int = Field(..., description="Quantity", ge=1)

class BasketItemResponse(BaseModel):
    id: int
    product: 'ProductResponse'
    quantity: int


class ProductCreateRequest(BaseModel):
    name: str
    price: float
    description: str | None = None
    stock: int


class ProductUpdateRequest(BaseModel):
    name: str | None = None
    price: float | None = None
    description: str | None = None
    stock: int | None = None


class ProductResponse(BaseModel):
    id: int | None = None
    name: str
    price: float
    description: str | None = None
    stock: int

    class Config:
        from_attributes = True




# =========================
# App Initialization
# =========================

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield



app = FastAPI(title=settings.app_name, lifespan=lifespan)


# Allow CORS for frontend (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# =========================
# Product Endpoints
# =========================

@app.get("/products/", response_model=List[ProductResponse])
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))
    products = result.scalars().all()
    return products



@app.get("/products/{product_id}", response_model=ProductResponse)
async def get_product_by_id(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    db_product = result.scalar_one_or_none()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found!")
    return db_product



@app.post("/products/", response_model=ProductResponse)
async def create_product(product: ProductCreateRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.name == product.name))
    db_product = result.first()
    if db_product:
        raise HTTPException(status_code=400, detail="Product name already registered!")
    db_product = Product(name=product.name, price=product.price, description=product.description, stock=product.stock)
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product



@app.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, product: ProductUpdateRequest, db: AsyncSession = Depends(get_db)):
    db_product = await db.get(Product, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found!")
    for field, value in product.model_dump(exclude_unset=True).items():
        setattr(db_product, field, value)
    await db.commit()
    await db.refresh(db_product)
    return db_product



@app.delete("/products/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    db_product = await db.get(Product, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found!")
    # Remove from basket_items if present
    result = await db.execute(select(BasketItem).where(BasketItem.product_id == product_id))
    basket_items = result.scalars().all()
    for item in basket_items:
        await db.delete(item)
    await db.delete(db_product)
    await db.commit()
    return {"message": "Product was deleted successfully!"}


# =========================
# Basket Endpoints
# =========================

@app.get("/basket/", response_model=list[BasketItemResponse])
async def get_basket(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BasketItem))
    basket_items = result.scalars().all()
    items = []
    for item in basket_items:
        db_product = await db.get(Product, item.product_id)
        if db_product:
            items.append(BasketItemResponse(id=item.id, product=ProductResponse.model_validate(db_product), quantity=item.quantity))
        else:
            # Remove basket item if product is deleted
            await db.delete(item)
    await db.commit()
    return items


@app.post("/basket/", response_model=BasketItemResponse)
async def add_to_basket(item: BasketItemRequest, db: AsyncSession = Depends(get_db)):
    db_product = await db.get(Product, item.product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found!")
    if db_product.stock < item.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock!")
    # Add or update basket item
    result = await db.execute(select(BasketItem).where(BasketItem.product_id == item.product_id))
    basket_item = result.scalar_one_or_none()
    if basket_item:
        basket_item.quantity += item.quantity
    else:
        basket_item = BasketItem(product_id=item.product_id, quantity=item.quantity)
        db.add(basket_item)
    # Decrement stock
    db_product.stock -= item.quantity
    await db.commit()
    await db.refresh(basket_item)
    await db.refresh(db_product)
    return BasketItemResponse(id=basket_item.id, product=ProductResponse.model_validate(db_product), quantity=basket_item.quantity)


@app.delete("/basket/{product_id}", response_model=dict)
async def remove_from_basket(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BasketItem).where(BasketItem.product_id == product_id))
    basket_item = result.scalar_one_or_none()
    if not basket_item:
        raise HTTPException(status_code=404, detail="Product not in basket!")
    db_product = await db.get(Product, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found!")
    db_product.stock += 1
    if basket_item.quantity > 1:
        basket_item.quantity -= 1
        await db.commit()
        await db.refresh(db_product)
        return {"message": "Decremented product quantity in basket."}
    else:
        await db.delete(basket_item)
        await db.commit()
        await db.refresh(db_product)
        return {"message": "Product removed from basket."}



# =========================
# Main Entrypoint
# =========================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
