import { userRoles } from "./enum";
import { UserRights } from "../utils";

export interface UserRequest {
  id: string;
  name: string;
  email: string;
  userId?: string | null;
  role?: userRoles;
  rights?: UserRights[];
}
