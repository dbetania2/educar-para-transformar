import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "La sección de materiales no está disponible en este sistema." }, { status: 404 });
}
