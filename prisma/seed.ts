import {
  PrismaClient,
  RoleSlug,
  TransactionType,
  TransactionStatus,
  DataVisibility,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.verificationLog.deleteMany();
  await prisma.transactionBatchLine.deleteMany();
  await prisma.wasteLog.deleteMany();
  await prisma.inventoryBatch.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.report.deleteMany();
  await prisma.backupJob.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  const perms = await prisma.$transaction([
    prisma.permission.create({
      data: { name: "Kelola user", action: "manage", resource: "users" },
    }),
    prisma.permission.create({
      data: { name: "Lihat inventori", action: "read", resource: "inventory" },
    }),
    prisma.permission.create({
      data: { name: "Ubah inventori", action: "write", resource: "inventory" },
    }),
    prisma.permission.create({
      data: { name: "Verifikasi", action: "verify", resource: "transactions" },
    }),
  ]);

  const roles = await prisma.$transaction([
    prisma.role.create({
      data: {
        name: "Super Admin",
        slug: RoleSlug.SUPER_ADMIN,
        description: "Akses penuh sistem",
      },
    }),
    prisma.role.create({
      data: {
        name: "Koordinator SPPG",
        slug: RoleSlug.KOORDINATOR_SPPG,
        description: "Verifikasi & laporan",
      },
    }),
    prisma.role.create({
      data: {
        name: "Petugas Gudang",
        slug: RoleSlug.PETUGAS_GUDANG,
        description: "Input stok & transaksi",
      },
    }),
    prisma.role.create({
      data: {
        name: "Petugas Gizi",
        slug: RoleSlug.PETUGAS_GIZI,
        description: "Monitoring read-only",
      },
    }),
    prisma.role.create({
      data: {
        name: "Stok Auditor",
        slug: RoleSlug.STOK_AUDITOR,
        description: "Audit & ekspor",
      },
    }),
  ]);

  const [superAdminRole] = roles;

  await prisma.rolePermission.createMany({
    data: perms.map((p) => ({ roleId: superAdminRole.id, permissionId: p.id })),
  });

  const hash = await bcrypt.hash("Demo123!", 12);

  const usersData: {
    email: string;
    username: string;
    name: string;
    slug: RoleSlug;
  }[] = [
    {
      email: "admin@mbg.local",
      username: "admin",
      name: "Super Admin",
      slug: RoleSlug.SUPER_ADMIN,
    },
    {
      email: "koordinator@mbg.local",
      username: "koordinator",
      name: "Koordinator SPPG",
      slug: RoleSlug.KOORDINATOR_SPPG,
    },
    {
      email: "gudang@mbg.local",
      username: "gudang",
      name: "Petugas Gudang",
      slug: RoleSlug.PETUGAS_GUDANG,
    },
    {
      email: "gizi@mbg.local",
      username: "gizi",
      name: "Petugas Gizi",
      slug: RoleSlug.PETUGAS_GIZI,
    },
    {
      email: "auditor@mbg.local",
      username: "auditor",
      name: "Stok Auditor",
      slug: RoleSlug.STOK_AUDITOR,
    },
  ];

  for (const u of usersData) {
    const role = roles.find((r) => r.slug === u.slug)!;
    await prisma.user.create({
      data: {
        email: u.email,
        username: u.username,
        name: u.name,
        passwordHash: hash,
        roleId: role.id,
      },
    });
  }

  const beras = await prisma.inventoryItem.create({
    data: {
      name: "Beras Medium",
      sku: "BR-MED-01",
      category: "Pokok",
      unit: "kg",
      minStock: 50,
      maxStock: 5000,
    },
  });

  await prisma.inventoryItem.create({
    data: {
      name: "Telur Ayam",
      sku: "TLR-01",
      category: "Protein Hewani",
      unit: "butir",
      minStock: 200,
      maxStock: 20000,
    },
  });

  const adminUser = await prisma.user.findFirst({
    where: { username: "admin" },
  });

  if (adminUser) {
    const batch = await prisma.inventoryBatch.create({
      data: {
        itemId: beras.id,
        batchNo: "B-SEED-1",
        quantity: 500,
        remainingQuantity: 500,
        unitCost: 12000,
        receivedAt: new Date(),
      },
    });

    await prisma.inventoryTransaction.create({
      data: {
        type: TransactionType.INBOUND,
        status: TransactionStatus.APPROVED,
        visibility: DataVisibility.PUBLIC,
        itemId: beras.id,
        quantity: 500,
        supplier: "Seed Supplier",
        unitPrice: 12000,
        performedAt: new Date(),
        createdById: adminUser.id,
        verifiedById: adminUser.id,
        approvedAt: new Date(),
        batchLines: {
          create: {
            batchId: batch.id,
            quantity: 500,
            unitCost: 12000,
          },
        },
      },
    });
  }

  await prisma.systemConfig.upsert({
    where: { key: "app.version" },
    create: { key: "app.version", value: "1.0.0" },
    update: { value: "1.0.0" },
  });

  // eslint-disable-next-line no-console
  console.log("Seed selesai. Demo password semua akun: Demo123!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
