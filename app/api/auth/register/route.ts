import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { NewUserRegister, UserRegister } from "@/app/types/userRegister";

export const dynamic = "force-static";

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export async function POST(request: Request) {
  const doc = new GoogleSpreadsheet(
    process.env.GOOGLE_SHEET_ID as string,
    serviceAccountAuth
  );
  await doc.loadInfo();

  try {
    const sheet = doc.sheetsByTitle["users"];
    const user: Promise<UserRegister> = request.json();

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid data" }), {
        status: 404,
      });
    }

    const { nickname, name, passwordHash } = await user;
    if (!nickname || !name || !passwordHash) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 404 }
      );
    }

    const rows = await sheet.getRows();
    const existingUser = rows.map((row) => ({
      id: row.get("id") || "",
      nickname: row.get("nickname") || "",
    }));

    const userEmailExists = existingUser.some(
      (row) => row.nickname === nickname
    );

    const id =
      existingUser.reduce((maxId, row) => {
        const rowId = Number(row.id);
        return Math.max(maxId, rowId);
      }, 0) + 1;

    if (userEmailExists) {
      return new Response(
        JSON.stringify({ error: "User with this nickname already exists" }),
        { status: 409 }
      );
    }

    const date: string = new Date()
      .toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
      .toString();
    const time: string = new Date()
      .toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })
      .toString();
    const dateTime: string = `${date},${time}`;

    const newUser: NewUserRegister = {
      id: id.toString(),
      nickname,
      name,
      passwordHash,
      createdAt: dateTime,
      lastLoginAt: dateTime,
      loginHistory: [].toString(),
    };

    await sheet.addRow(newUser);
    return new Response(
      JSON.stringify({ message: "User created successfully" }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response(JSON.stringify({ error: "Error creating user" }), {
      status: 500,
    });
  }
}
