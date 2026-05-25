import { UserRole } from "@prisma/client";
import prisma from "../src/app/db/prisma";
import bcrypt from "bcrypt";
import config from "../src/app/config";

const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await prisma.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN,
      },
    });

    if (isSuperAdminExist) {
      console.log("Super Admin already exists.");
      return;
    }

    const hashedPassword: string = await bcrypt.hash(
      config.super_admin_password as string,
      Number(config.bcrypt_salt_rounds),
    );

    const superAdminData = await prisma.user.create({
      data: {
        name: config.super_admin_name as string,
        email: config.super_admin_email as string,
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        userProfile: {
          create: {
            bio: "Super Admin of Trip Together application.",
            age: 25,
            gender: "MALE",
          },
        },
      },
    });

    console.log("Super Admin created successfully:", superAdminData);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
};

seedSuperAdmin();
