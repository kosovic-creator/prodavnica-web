import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"
// GET - Fetch single user
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
      const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 401 });
    }

    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Korisnik nije pronađen" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Greška pri učitavanju korisnika" }, { status: 500 });
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
      const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 401 });
    }

    const { id } = await context.params;
    const { name, email, password, role } = await request.json();

    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    } = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Greška pri ažuriranju korisnika" }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
      const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 401 });
    }

    const { id } = await context.params;

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Korisnik je uspešno obrisan" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Greška pri brisanju korisnika" }, { status: 500 });
  }
}
