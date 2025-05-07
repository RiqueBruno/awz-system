import { GoogleSpreadsheet } from "google-spreadsheet";
import { cookies } from "next/headers";
import { JWT } from "google-auth-library";

export const dynamic = "force-static"; // This will make sure the page is not cached by the browser

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const getCookie = async (name: string): Promise<string> => {
  try {
    const cookieStore = await cookies();
    if (cookieStore.has(name)) {
      throw new Error(`${name} cookie not found`);
    }
    const cookie = cookieStore.get(name)?.value;
    if (!cookie) {
      throw new Error(`${name} cookie is empty`);
    }
    return cookie;
  } catch (error) {
    console.error("Error getting cookie:", error);
    return `${error}`;
  }
};

export async function GET() {
  const doc = new GoogleSpreadsheet(
    process.env.GOOGLE_SHEET_ID as string,
    serviceAccountAuth
  );
  await doc.loadInfo();

  try {
    const sheet = doc.sheetsByTitle["users"];
    const rows = await sheet.getRows();
    const users = rows.map((row) => {
      return {
        id: row.get("id") || "",
        nickname: row.get("nickname") || "",
        name: row.get("name") || "",
        createdAt: row.get("createdAt") || "",
        lastLoginAt: row.get("lastLoginAt") || "",
        loginHistory: row.get("loginHistory") || [],
      };
    });

    const cookie = await getCookie("nickname");
    if (!cookie) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
      });
    }
    const user = users.find((user) => user.nickname === cookie);
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }
    const userData = {
      id: user.id,
      nickname: user.nickname,
      name: user.name,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      loginHistory: user.loginHistory,
    };

    return Response.json(userData, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
