import bcrypt from "bcrypt";
import { db } from "./db";
import { UserRole } from "../app/constants/user-role";
import config from "../app/config";

const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await db.orm.public.User.first({
      role: UserRole.SUPER_ADMIN,
    });

    if (isSuperAdminExist) {
      console.log("Super Admin already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      config.super_admin_password as string,
      Number(config.bcrypt_salt_rounds),
    );

    const superAdmin = await db.transaction(async (tx) => {
      const user = await tx.orm.public.User.create({
        name: config.super_admin_name as string,
        email: config.super_admin_email as string,
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
      });

      await tx.orm.public.UserProfile.create({
        userId: user.id,
        bio: "Super Admin of Trip Together application.",
        age: 25,
        gender: "MALE",
      });

      return user;
    });

    console.log("Super Admin created successfully:", superAdmin);
  } catch (err) {
    console.error(err);
  } finally {
    await db.close();
  }
};

seedSuperAdmin();
