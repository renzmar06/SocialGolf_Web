import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

/* =========================
   DELETE (Soft Delete)
========================= */
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Missing product ID' },
      { status: 400 }
    );
  }

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return NextResponse.json(
      { success: false, message: 'Product not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}

/* =========================
   PATCH (Archive / Status)
========================= */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Missing product ID' },
      { status: 400 }
    );
  }

  const body = await req.json();
  const updateData: any = { ...body };

  if (body.status === 'Archived') {
    updateData.archivedAt = new Date();
  }

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!product) {
    return NextResponse.json(
      { success: false, message: 'Product not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: product });
}

/* =========================
   PUT (Edit Product)
========================= */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Missing product ID' },
      { status: 400 }
    );
  }

  const formData = await req.formData();
  const updateData: any = {};

  for (const [key, value] of formData.entries()) {
    if (key === 'image') continue;
    if (value === '' || value === 'undefined') continue;

    if (['price', 'salePrice', 'inventoryCount'].includes(key)) {
      updateData[key] = Number(value);
    } else {
      updateData[key] = value;
    }
  }

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!product) {
    return NextResponse.json(
      { success: false, message: 'Product not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: product ,message: 'Product update sucessfully.',status: 200  });
   
}
