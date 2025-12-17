import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    const userId = formData.get('userId');
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 200 }
      );
    }

    const name = formData.get('name');
    const category = formData.get('category');
    const brand = formData.get('brand');
    const price = formData.get('price');
    const salePrice = formData.get('salePrice');
    const inventoryCount = formData.get('inventoryCount');
    const condition = formData.get('condition');
    const status = formData.get('status');
    const description = formData.get('description');

    const file = formData.get('image');
    let imageUrl = '';

    if (file && file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;

      const uploadDir = path.join(process.cwd(), 'tmp/uploads');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);

      imageUrl = `/uploads/${filename}`;
    }

    const product = await Product.create({
      userId,
      name,
      category,
      brand,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : undefined,
      inventoryCount: inventoryCount ? Number(inventoryCount) : 0,
      condition,
      status,
      description,
      images: imageUrl ? [imageUrl] : [],
    });

    return NextResponse.json(
      { success: true, message: 'Product created successfully', data: product }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 200 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');
    
    let query: any = { isDeleted: { $ne: true } };
    if (userRole !== 'superadmin' && userId) {
      query.userId = userId;
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, message: 'Products fetched successfully', data: products });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 200 }
    );
  }
}
