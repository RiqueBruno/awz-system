import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { UserLogin } from "@/app/types/userLogin";

export const dynamic = "force-static"; // This will make sure the page is not cached by the browser

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

export async function GET() {
  const doc = new GoogleSpreadsheet(
    process.env.GOOGLE_SHEET_ID as string,
    serviceAccountAuth
  );
  await doc.loadInfo();

  try {
    const sheet = doc.sheetsByTitle["users"];
    const rows = await sheet.getRows();
    const users: UserLogin[] = rows.map((row) => {
      return {
        id: row.get("id") || "",
        nickname: row.get("nickname") || "",
        name: row.get("name") || "",
        createdAt: row.get("createdAt") || "",
        lastLoginAt: row.get("lastLoginAt") || "",
        loginHistory: row.get("loginHistory") || [],
      };
    });
    return Response.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
