import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
      const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "Fajl nije pronađen" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({
            error: "Nije dozvoljen tip fajla. Dozvoljeni su: JPEG, PNG, WebP"
      }, { status: 400 });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return NextResponse.json({
            error: "Fajl je prevelik. Maksimalna veličina je 5MB"
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;

    // Save to public/uploads directory
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, fileName);

    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    await writeFile(filePath, buffer);

    // Return the public URL
    const imageUrl = `/uploads/${fileName}`;

      return NextResponse.json({
      message: "Fajl je uspešno uploadan",
      imageUrl: imageUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error("Error uploading file:", error);
      return NextResponse.json({
          error: "Greška pri uploadu fajla"
    }, { status: 500 });
  }
}
