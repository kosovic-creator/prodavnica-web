import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Since NextAuth handles logout via the client-side signOut function,
    // this endpoint can be used for additional cleanup if needed
    
    return NextResponse.json(
      { message: "Uspešno ste se odjavili" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Greška prilikom odjave" },
      { status: 500 }
    );
  }
}
