
import { User } from "@/types";

// Mock user data
export const mockUser: User = {
  id: "1",
  name: "Prestador Demo",
  email: "demo@kendrah.com",
  phoneNumber: "11 98765-4321",
  createdAt: new Date("2023-01-01"),
  trialEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
  isSubscribed: false,
  whatsappNumber: "5511987654321"
};
