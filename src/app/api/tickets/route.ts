import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 401 });
    }

    // 2. Parse FormData
    const formData = await req.formData();
    const subject = formData.get("subject") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const files = formData.getAll("files") as File[];

    // 3. Validation
    if (!subject || !subject.trim()) {
      return NextResponse.json({ error: "אנא הזן את נושא הפנייה" }, { status: 400 });
    }
    if (!category || !category.trim()) {
      return NextResponse.json({ error: "אנא בחר קטגוריה" }, { status: 400 });
    }
    if (!description || !description.trim()) {
      return NextResponse.json({ error: "אנא הזן פירוט על התקלה" }, { status: 400 });
    }

    const fileLinks: { name: string; filename: string }[] = [];

    // 4. File uploads (Optional)
    if (files && files.length > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      // Ensure the directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      for (const file of files) {
        // Ensure it's a valid File object and not empty
        if (file && typeof file.name === "string" && file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer());
          // Clean file name to prevent directory traversal or invalid character issues
          const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
          const uniqueFilename = `${Date.now()}_${safeName}`;
          const filePath = path.join(uploadDir, uniqueFilename);
          
          await fs.writeFile(filePath, buffer);
          fileLinks.push({
            name: file.name,
            filename: uniqueFilename
          });
        }
      }
    }

    // 5. Append file references to the description
    let finalDescription = description;
    if (fileLinks.length > 0) {
      finalDescription += "\n\n---\n📎 קבצים מצורפים:\n" + 
        fileLinks.map(f => `- [${f.name}](/uploads/${f.filename})`).join("\n");
    }

    // 6. Save ticket in database
    const ticket = await prisma.ticket.create({
      data: {
        title: subject.trim(),
        category: category.trim(),
        description: finalDescription,
        userId: userId, // Tied to the logged-in user from backend session
        status: "OPEN",
        priority: "MEDIUM"
      }
    });

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "אירעה שגיאה בשליחת הקריאה. אנא נסה שוב מאוחר יותר." },
      { status: 500 }
    );
  }
}
