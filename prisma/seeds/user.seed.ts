import { PrismaClient, Role } from '../../src/generated/prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const seedUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // Create a SUPERADMIN
    const superAdmin = await prisma.user.create({
      data: {
        user_code: `USR_${Date.now()}_SA`,
        username: 'superadmin_helpon',
        fullname: 'Super Admin Helpon',
        email: 'superadmin@helpon.com',
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
        verified: true
      }
    });
    console.log('Super Admin created:', {
      id: superAdmin.id,
      username: superAdmin.username
    });

    // Create an ADMIN
    const admin = await prisma.user.create({
      data: {
        user_code: `USR_${Date.now()}_A`,
        username: 'admin_helpon',
        fullname: 'Admin Helpon',
        email: 'admin@helpon.com',
        password: hashedPassword,
        role: Role.ADMIN,
        verified: true
      }
    });
    console.log('Admin created:', { id: admin.id, username: admin.username });

    // Create a COORDINATOR
    const coordinator = await prisma.user.create({
      data: {
        user_code: `USR_${Date.now()}_A`,
        username: 'coordinator_helpon',
        fullname: 'Coordinator Helpon',
        email: 'coordinator@helpon.com',
        password: hashedPassword,
        role: Role.COORDINATOR,
        verified: true
      }
    });
    console.log('Coordinator created:', {
      id: coordinator.id,
      username: coordinator.username
    });

    // Create a HELPER
    const helper = await prisma.user.create({
      data: {
        user_code: `USR_${Date.now()}_A`,
        username: 'helper_helpon',
        fullname: 'Helper Helpon',
        email: 'helper@helpon.com',
        password: hashedPassword,
        role: Role.HELPER,
        verified: true
      }
    });
    console.log('Helper created:', {
      id: helper.id,
      username: helper.username
    });

    // Create a CUSTOMER
    const customer = await prisma.user.create({
      data: {
        user_code: `USR_${Date.now()}_A`,
        username: 'customer_helpon',
        fullname: 'Customer Helpon',
        email: 'customer@helpon.com',
        password: hashedPassword,
        role: Role.CUSTOMER,
        verified: true
      }
    });
    console.log('Customer created:', {
      id: customer.id,
      username: customer.username
    });

    // Create other users
    const roles = [Role.COORDINATOR, Role.CUSTOMER, Role.HELPER];
    for (let i = 0; i < 6; i++) {
      const fakeUserName: string = faker.internet.username();
      const fakeFullName: string = faker.person.fullName();
      const fakeUserEmail: string = faker.internet.email();
      const fakeUserCode = `USR_${Date.now()}_${i}`;
      const userRole = roles[i % roles.length];

      const user = await prisma.user.create({
        data: {
          user_code: fakeUserCode,
          username: fakeUserName,
          fullname: fakeFullName,
          email: fakeUserEmail,
          password: hashedPassword,
          role: userRole,
          verified: true
        }
      });

      console.log(`User ${i + 1} created:`, {
        id: user.id,
        username: user.username,
        role: user.role
      });
    }
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
