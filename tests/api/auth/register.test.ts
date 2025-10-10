import { POST } from "@/app/api/auth/register/route";
import bcrypt from "bcrypt";
import createNextRequest from "../../helperfunction/helper";
import { db } from "@/lib/prisma";

jest.mock("bcrypt");
jest.mock("@/lib/prisma", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn()
    },
    planConfig: {
      findUnique: jest.fn()
    }
  }
}));
 
(bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValue("hashed-password");

describe("register end point", () => {
  it("returns 400 if required fields are missing", async () => {
    const req = createNextRequest({
      email: "test@example.com",
      password: "",
      firstName: "",
      lastName: ""
    });
    
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
it("returns 400 if password format is invalid", async () => {
    const req =  createNextRequest({
        email: "test@example.com",
      password: "Short",
      firstName: "Ailwei",
      lastName: "Maemu"

    })
    const res = await POST(req);
    expect(res.status).toBe(400);
})
it("returns 200 when registration is successful", async () => {
    (db.user.findUnique as jest.Mock).mockResolvedValue(null);
    (db.planConfig.findUnique as jest.Mock).mockResolvedValue({ id: "plan-1", type: "FREE" });
    (db.user.create as jest.Mock).mockResolvedValue({
      id: 1,
      email: "test@example.com",
      firstName: "Ailwei",
      lastName: "Maemu",
      Subscription: []
    });

    const req = createNextRequest({
      email: "test@example.com",
      password: "Iweee@8899",
      firstName: "Ailwei",
      lastName: "Maemu"
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.userId).toBe(1);
    expect(json.email).toBe("test@example.com");
  });
